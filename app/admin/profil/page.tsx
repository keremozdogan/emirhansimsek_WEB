import { ProfileForm } from "@/components/admin/profile-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { getProfile } from "@/lib/queries";

export const revalidate = 0;

export const metadata = { title: "Profil" };

export default async function AdminProfilePage() {
  const profile = await getProfile();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Profil"
        description="Emirhan'ın kimlik bilgileri, iletişim kanalları, görselleri ve ana sayfadaki rakamları. Buradaki değişiklikler sitenin tamamına yansır."
      />
      <ProfileForm profile={profile} />
    </div>
  );
}
