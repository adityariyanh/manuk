import { EquipmentForm } from "@/components/equipment-form";

export default function NewEquipmentPage() {
  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Register New Equipment</h1>
        <p className="text-muted-foreground">Fill in the details below to add a new item to the inventory.</p>
      </header>
      <EquipmentForm />
    </div>
  );
}
