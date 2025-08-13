'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { addEquipment, addLog, getEquipmentById, getHistoricalBorrowingDataString, updateEquipment } from './data';
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
    };
  }

  try {
    const newEquipment = await addEquipment(validatedFields.data);
    await addLog({ equipmentId: newEquipment.id, action: 'Registered' });
  } catch (error) {
    return {
      message: 'Database Error: Failed to create equipment.',
    };
  }

  revalidatePath('/');
  revalidatePath('/history');
  redirect('/');
}

export async function checkoutEquipment(equipmentId: string, user: string) {
  try {
    await updateEquipment(equipmentId, { status: 'Borrowed', borrowedBy: user });
    await addLog({ equipmentId, action: 'Borrowed', user });
    revalidatePath('/');
    revalidatePath(`/equipment/${equipmentId}`);
    revalidatePath('/history');
    return { success: true, message: 'Equipment checked out successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to checkout equipment.' };
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
    return { success: false, message: 'Failed to checkin equipment.' };
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
    return { success: false, message: 'Failed to mark equipment as repaired.' };
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
