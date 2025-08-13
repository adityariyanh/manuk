
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addEquipment, addLog, deleteEquipment as deleteEquipmentData, getAllEquipment, getEquipmentById, updateEquipment } from './data';
import { addDays, startOfDay } from 'date-fns';
import type { Equipment } from './types';

const equipmentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  brand: z.string().min(2, 'Brand/Type must be at least 2 characters'),
  model: z.string().min(1, 'Model is required'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
});

export type FormState = {
  message: string;
  errors?: {
    name?: string[];
    brand?: string[];
    model?: string[];
    category?: string[];
  };
  success?: boolean;
};

export async function registerEquipment(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = equipmentSchema.safeParse({
    name: formData.get('name'),
    brand: formData.get('brand'),
    model: formData.get('model'),
    category: formData.get('category'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create equipment.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const newEquipment = await addEquipment(validatedFields.data);
    await addLog({ equipmentId: newEquipment.id, action: 'Registered' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Database Error:', error);
    return {
      message: `Database Error: Failed to create equipment. ${message}`,
      success: false,
    };
  }

  revalidatePath('/');
  revalidatePath('/history');
  revalidatePath('/equipment/new');
  return { message: `Successfully added "${validatedFields.data.name}".`, success: true };
}

export async function checkoutEquipment(
  equipmentId: string,
  user: string,
  place: string,
  description: string,
  phone?: string,
  borrowedFrom?: Date,
  borrowedUntil?: Date,
) {
  try {
    const notes = `Place: ${place}. Purpose: ${description}.`;
    const updateData: Partial<Equipment> = { 
      status: 'Borrowed', 
      borrowedBy: user,
      borrowedFrom: borrowedFrom || new Date(),
      borrowedUntil: borrowedUntil || addDays(new Date(), 1), // Default to 1 day if not provided
      reminderSent: false,
    };

    if (phone) {
      updateData.borrowerPhone = phone;
    }
    
    await updateEquipment(equipmentId, updateData);
    await addLog({ equipmentId, action: 'Borrowed', user, notes });

    revalidatePath('/');
    revalidatePath(`/equipment/${equipmentId}`);
    revalidatePath('/history');
    return { success: true, message: 'Equipment checked out successfully.' };
  } catch (error) {
    console.error('Checkout Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to checkout equipment.';
    return { success: false, message };
  }
}

export async function checkinEquipment(equipmentId: string) {
  try {
    const equipment = await getEquipmentById(equipmentId);
    if (equipment) {
      await addLog({ equipmentId, action: 'Returned', user: equipment.borrowedBy });
    }
    // Reset borrow-related fields. Using null to clear fields in Firestore.
    await updateEquipment(equipmentId, { 
      status: 'Available', 
      borrowedBy: null,
      borrowerPhone: null,
      borrowedFrom: null,
      borrowedUntil: null,
      reminderSent: null,
    });
    revalidatePath('/');
    revalidatePath(`/equipment/${equipmentId}`);
    revalidatePath('/history');
    return { success: true, message: 'Equipment checked in successfully.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to checkin equipment.';
    return { success: false, message };
  }
}

export async function markAsRepaired(equipmentId: string) {
  try {
    await updateEquipment(equipmentId, { status: 'Available' });
    await addLog({ equipmentId, action: 'Repaired', user: 'Admin' });
    revalidatePath('/');
    revalidatePath(`/equipment/${equipmentId}`);
    revalidatePath('/history');
    return { success: true, message: 'Equipment marked as repaired.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark as repaired.';
    return { success: false, message };
  }
}

export type RepairState = {
  message: string;
  error?: string;
  success?: boolean;
}

export async function reportForRepair(
  formData: FormData,
): Promise<RepairState> {
    const equipmentId = formData.get('equipmentId') as string;
    const userName = formData.get('userName') as string;
    const problem = formData.get('problem') as string;

    if(!equipmentId || !userName || !problem) {
        return { message: "Invalid input", error: "Missing required fields.", success: false };
    }

    try {
        const equipment = await getEquipmentById(equipmentId);
        if (!equipment) {
            return { message: "Equipment not found", error: "The specified equipment does not exist.", success: false };
        }

        await updateEquipment(equipmentId, { status: 'Under Repair' });
        await addLog({ equipmentId, action: 'Reported for Repair', user: userName, notes: problem });

        revalidatePath('/');
        revalidatePath(`/equipment/${equipmentId}`);
        revalidatePath('/history');
        
        return { message: "Successfully reported for repair.", success: true };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Report for Repair Error:", errorMessage);
        return { message: "An error occurred", error: errorMessage, success: false };
    }
}

export async function deleteEquipment(equipmentId: string) {
    try {
        await deleteEquipmentData(equipmentId);
        revalidatePath('/');
        revalidatePath('/history');
        return { success: true, message: 'Equipment deleted successfully.' };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete equipment.';
        return { success: false, message };
    }
}


export async function checkReminders() {
  console.log('Checking for reminders...');
  const today = startOfDay(new Date());
  const twoDaysFromNow = addDays(today, 2);

  try {
    const allEquipment = await getAllEquipment();
    const borrowedItems = allEquipment.filter(
      (e) =>
        e.status === 'Borrowed' &&
        e.borrowedUntil &&
        !e.reminderSent
    );

    let shouldRevalidate = false;
    for (const item of borrowedItems) {
      const borrowedUntilDate = startOfDay(item.borrowedUntil!); // Use non-null assertion
      
      // Check if the return date is on or before two days from now
      if (borrowedUntilDate <= twoDaysFromNow) {
        console.log(`Follow up triggered for ${item.name}. Due on: ${borrowedUntilDate.toDateString()}`);
        await updateEquipment(item.id, { status: 'Follow Up', reminderSent: true });
        shouldRevalidate = true;
      }
    }

    if (shouldRevalidate) {
      revalidatePath('/');
      console.log('Follow up check complete. Paths revalidated.');
    } else {
      console.log('Follow up check complete. No new reminders.');
    }
  } catch (error) {
    console.error("Error checking for follow ups:", error);
  }
}
