import { AdminPackageForm } from "@/components/admin/AdminPackageForm";
import type { AdminData } from "@/lib/admin/data";

export function PackageEditorPage({ data }: { data: AdminData }) {
  return (
    <section className="admin-creation-layout" data-variant="package">
      <article className="admin-creation-main">
        <div className="admin-creation-head">
          <span>B2B package</span>
          <h2>기관 견적에 사용할 프로그램 묶음을 만듭니다.</h2>
          <p>기간, 인원수, 프로그램 선택에 따라 통 견적서가 만들어질 수 있도록 프로그램과 할인 구간을 함께 설정합니다.</p>
        </div>
        <AdminPackageForm
          discountTiers={data.discountTiers}
          options={data.packageOptions}
          programs={data.programs}
        />
      </article>
    </section>
  );
}
