
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
  name: z.string().min(1, 'Nama wajib diisi'),
  brand: z.string().min(2, 'Merek harus minimal 2 karakter'),
  model: z.string().min(1, 'Model wajib diisi'),
  category: z.string().min(2, 'Kategori harus minimal 2 karakter'),
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
      message: 'Gagal membuat peralatan.',
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
      error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
    console.error('Database Error:', error);
    return {
      message: `Database Error: Gagal membuat peralatan. ${message}`,
      success: false,
    };
  }

  return {
    message: `Berhasil menambahkan "${validatedFields.data.name}".`,
    success: true,
  };
}

export async function updateEquipmentDetails(equipmentId: string, equipmentData: unknown) {
    const validatedFields = equipmentSchema.safeParse(equipmentData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validasi gagal: " + validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await updateEquipment(equipmentId, validatedFields.data);
        await addLog({
            equipmentId,
            action: 'Updated',
            user: 'Admin',
            notes: 'Detail peralatan diperbarui.'
        });
        revalidatePath('/');
        revalidatePath(`/equipment/${equipmentId}`);
        revalidatePath('/history');
        return { success: true, message: 'Peralatan berhasil diperbarui.' };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
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
      message: 'Validasi data gagal. Silakan periksa format dan konten file.',
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
      error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
    console.error('Bulk Add Database Error:', error);
    return {
      success: false,
      message: `Database Error: Gagal menambahkan peralatan secara massal. ${message}`,
    };
  }
    
  return {
    success: true,
    message: `Berhasil menambahkan ${validatedFields.data.length} item peralatan.`,
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
    const notes = `Tempat: ${place}. Tujuan: ${description}.`;
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
    return { success: true, message: 'Peralatan berhasil dipinjam.' };
  } catch (error) {
    console.error('Checkout Error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Gagal meminjam peralatan.';
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
    return { success: true, message: 'Peralatan berhasil dikembalikan.' };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gagal mengembalikan peralatan.';
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
    return { success: true, message: 'Peralatan ditandai selesai diperbaiki.' };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gagal menandai selesai diperbaiki.';
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
      message: 'Input tidak valid',
      error: 'Bidang yang wajib diisi tidak ada.',
      success: false,
    };
  }

  try {
    const equipment = await getEquipmentById(equipmentId);
    if (!equipment) {
      return {
        message: 'Peralatan tidak ditemukan',
        error: 'Peralatan yang ditentukan tidak ada.',
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

    return { message: 'Berhasil dilaporkan untuk perbaikan.', success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Report for Repair Error:', errorMessage);
    return { message: 'Terjadi kesalahan', error: errorMessage, success: false };
  }
}

export async function deleteEquipment(equipmentId: string) {
  try {
    await deleteEquipmentData(equipmentId);
    revalidatePath('/');
    revalidatePath('/history');
    return { success: true, message: 'Peralatan berhasil dihapus.' };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gagal menghapus peralatan.';
    return { success: false, message };
  }
}

export async function checkReminders() {
  console.log('Memeriksa pengingat...');
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
          `Tindak lanjut dipicu untuk ${
            item.name
          }. Jatuh tempo pada: ${borrowedUntilDate.toDateString()}`
        );
        await updateEquipment(item.id, {
          status: 'Follow Up',
          reminderSent: true,
        });
      }
    }
  } catch (error) {
    console.error('Error saat memeriksa tindak lanjut:', error);
  }
}
