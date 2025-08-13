'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { addEquipment, addLog, deleteEquipment as deleteEquipmentData, getEquipmentById, getHistoricalBorrowingDataString, updateEquipment } from './data';
import { suggestReplacementEquipment } from '@/ai/flows/suggest-replacement-equipment';

const equipmentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  model: z.string().min(2, 'Model must be at least 2 characters'),
  purchaseDate: z.coerce.date(),
});

export type FormState = {
  message: string;
  errors?: {
    name?: string[];
    model?: string[];
    purchaseDate?: string[];
  };
  success?: boolean;
};

export async function registerEquipment(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = equipmentSchema.safeParse({
    name: formData.get('name'),
    model: formData.get('model'),
    purchaseDate: formData.get('purchaseDate'),
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

export async function checkoutEquipment(equipmentId: string, user: string, place: string, description: string) {
  try {
    const notes = `Place: ${place}. Purpose: ${description}`;
    await updateEquipment(equipmentId, { status: 'Borrowed', borrowedBy: user });
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
    await updateEquipment(equipmentId, { status: 'Available', borrowedBy: undefined });
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
  suggestions?: Awaited<ReturnType<typeof suggestReplacementEquipment>>;
  error?: string;
}

export async function reportForRepair(
  prevState: RepairState,
  formData: FormData,
): Promise<RepairState> {
    const equipmentId = formData.get('equipmentId') as string;
    const userRole = formData.get('userRole') as string;
    const problem = formData.get('problem') as string;

    if(!equipmentId || !userRole || !problem) {
        return { message: "Invalid input", error: "Missing required fields." };
    }

    try {
        const equipment = await getEquipmentById(equipmentId);
        if (!equipment) {
            return { message: "Equipment not found", error: "The specified equipment does not exist." };
        }

        await updateEquipment(equipmentId, { status: 'Under Repair' });
        await addLog({ equipmentId, action: 'Reported for Repair', user: 'Admin', notes: problem });

        const historicalData = await getHistoricalBorrowingDataString();
        
        const suggestions = await suggestReplacementEquipment({
            brokenEquipmentName: equipment.name,
            userRole: userRole,
            historicalBorrowingData: historicalData,
        });

        revalidatePath('/');
        revalidatePath(`/equipment/${equipmentId}`);
        revalidatePath('/history');
        
        return { message: "Successfully reported for repair and got suggestions.", suggestions };

    } catch (error) {
        return { message: "An error occurred", error: error instanceof Error ? error.message : String(error) };
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
