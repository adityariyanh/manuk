'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addEquipment, addLog, deleteEquipment as deleteEquipmentData, getAllEquipment, getEquipmentById, updateEquipment } from './data';
import { addDays } from 'date-fns';

const equipmentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  brand: z.string().min(2, 'Brand/Type must be at least 2 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
});

export type FormState = {
  message: string;
  errors?: {
    name?: string[];
    brand?: string[];
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
  borrowedUntil?: Date,
) {
  try {
    const notes = `Place: ${place}. Purpose: ${description}.`;
    const updateData: Partial<Equipment> = { 
      status: 'Borrowed', 
      borrowedBy: user, 
      borrowerPhone: phone || undefined,
      borrowedUntil: borrowedUntil || undefined,
      reminderSent: false,
    };
    
    await updateEquipment(equipmentId, updateData);
    await addLog({ equipmentId, action: 'Borrowed', user, notes });

    revalidatePath('/');
    revalidatePath(`/equipment/${equipmentId}`);
    revalidatePath('/history');
    return { success: true, message: 'Equipment checked out successfully.' };
  } catch (error) {
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
    // Reset borrow-related fields
    await updateEquipment(equipmentId, { 
      status: 'Available', 
      borrowedBy: undefined, 
      borrowerPhone: undefined,
      borrowedUntil: undefined,
      reminderSent: undefined,
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
  const twoDaysFromNow = addDays(new Date(), 2);
  
  try {
    const allEquipment = await getAllEquipment();
    const borrowedItems = allEquipment.filter(e => 
      e.status === 'Borrowed' && 
      e.borrowedUntil && 
      !e.reminderSent
    );

    for (const item of borrowedItems) {
      if (item.borrowedUntil && item.borrowedUntil <= twoDaysFromNow) {
        console.log(`Reminder triggered for ${item.name}. Due on: ${item.borrowedUntil.toDateString()}`);
        await updateEquipment(item.id, { status: 'Reminder', reminderSent: true });
        // In a real app, you would also send an email or notification here.
        // For this app, changing the status will serve as the reminder.
        revalidatePath('/');
        revalidatePath(`/equipment/${item.id}`);
      }
    }
     revalidatePath('/');
     console.log('Reminder check complete.');
  } catch (error) {
      console.error("Error checking reminders:", error);
  }
}
