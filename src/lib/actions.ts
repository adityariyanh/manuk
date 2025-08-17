
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  addEquipment,
  addLog,
  deleteEquipment as deleteEquipmentData,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteField,
  batchAddEquipment,
} from './data';
import { addDays, startOfDay } from 'date-fns';
import type { Equipment } from './types';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(2, 'Brand must be at least 2 characters'),
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
    revalidatePath('/');
    revalidatePath('/history');
    revalidatePath('/equipment/new');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Database Error:', error);
    return {
      message: `Database Error: Failed to create equipment. ${message}`,
      success: false,
    };
  }

  return {
    message: `Successfully added "${validatedFields.data.name}".`,
    success: true,
  };
}

export async function updateEquipmentDetails(equipmentId: string, equipmentData: unknown) {
    const validatedFields = equipmentSchema.safeParse(equipmentData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed: " + validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await updateEquipment(equipmentId, validatedFields.data);
        await addLog({
            equipmentId,
            action: 'Updated',
            user: 'Admin',
            notes: 'Equipment details updated.'
        });
        revalidatePath('/');
        revalidatePath(`/equipment/${equipmentId}`);
        revalidatePath('/history');
        return { success: true, message: 'Equipment updated successfully.' };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Database Error: ${message}` };
    }
}

const bulkEquipmentSchema = z.array(equipmentSchema);

export async function bulkRegisterEquipment(equipmentData: unknown) {
  const validatedFields = bulkEquipmentSchema.safeParse(equipmentData);

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten());
    return {
      success: false,
      message: 'Data validation failed. Please check the file format and content.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await batchAddEquipment(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/history');
    revalidatePath('/equipment/new');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Bulk Add Database Error:', error);
    return {
      success: false,
      message: `Database Error: Failed to add equipment in bulk. ${message}`,
    };
  }
    
  return {
    success: true,
    message: `Successfully added ${validatedFields.data.length} equipment items.`,
  };
}


export async function checkoutEquipment(
  equipmentId: string,
  user: string,
  place: string,
  description: string,
  phone?: string,
  borrowedFrom?: Date,
  borrowedUntil?: Date
) {
  try {
    const notes = `Place: ${place}. Purpose: ${description}.`;
    const updateData: Partial<Equipment> = {
      status: 'Borrowed',
      borrowedBy: user,
      borrowedFrom: borrowedFrom || new Date(),
      borrowedUntil: borrowedUntil || addDays(new Date(), 1),
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
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to checkout equipment.';
    return { success: false, message };
  }
}

export async function checkinEquipment(equipmentId: string) {
  try {
    const equipment = await getEquipmentById(equipmentId);
    if (equipment) {
      await addLog({
        equipmentId,
        action: 'Returned',
        user: equipment.borrowedBy,
      });
    }

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
    const message =
      error instanceof Error ? error.message : 'Failed to checkin equipment.';
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
    const message =
      error instanceof Error ? error.message : 'Failed to mark as repaired.';
    return { success: false, message };
  }
}

export type RepairState = {
  message: string;
  error?: string;
  success?: boolean;
};

export async function reportForRepair(
  formData: FormData
): Promise<RepairState> {
  const equipmentId = formData.get('equipmentId') as string;
  const userName = formData.get('userName') as string;
  const problem = formData.get('problem') as string;

  if (!equipmentId || !userName || !problem) {
    return {
      message: 'Invalid input',
      error: 'Missing required fields.',
      success: false,
    };
  }

  try {
    const equipment = await getEquipmentById(equipmentId);
    if (!equipment) {
      return {
        message: 'Equipment not found',
        error: 'The specified equipment does not exist.',
        success: false,
      };
    }

    await updateEquipment(equipmentId, { status: 'Under Repair' });
    await addLog({
      equipmentId,
      action: 'Reported for Repair',
      user: userName,
      notes: problem,
    });

    revalidatePath('/');
    revalidatePath(`/equipment/${equipmentId}`);
    revalidatePath('/history');

    return { message: 'Successfully reported for repair.', success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Report for Repair Error:', errorMessage);
    return { message: 'An error occurred', error: errorMessage, success: false };
  }
}

export async function deleteEquipment(equipmentId: string) {
  try {
    await deleteEquipmentData(equipmentId);
    revalidatePath('/');
    revalidatePath('/history');
    return { success: true, message: 'Equipment deleted successfully.' };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete equipment.';
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
        (e.status === 'Borrowed' || e.status === 'Follow Up') &&
        e.borrowedUntil &&
        !e.reminderSent
    );

    for (const item of borrowedItems) {
      if (!item.borrowedUntil) continue;
      const borrowedUntilDate = startOfDay(new Date(item.borrowedUntil));

      if (borrowedUntilDate <= twoDaysFromNow) {
        console.log(
          `Follow up triggered for ${
            item.name
          }. Due on: ${borrowedUntilDate.toDateString()}`
        );
        await updateEquipment(item.id, {
          status: 'Follow Up',
          reminderSent: true,
        });
      }
    }
  } catch (error) {
    console.error('Error checking for follow ups:', error);
  }
}
