import { editorialInput } from "@/components/ui/editorial-primitives";
import {
  PREFERRED_CONTACT_OPTIONS,
  PREGNANCY_STATUS_OPTIONS,
  SEX_AT_BIRTH_OPTIONS,
  type MemberProfileDraft,
} from "@/lib/account/member-profile";

type MemberProfileFieldsProps = {
  value: MemberProfileDraft;
  onChange: (next: MemberProfileDraft) => void;
  includeName?: boolean;
  includeCompany?: boolean;
  inputClassName?: string;
};

function setField(
  value: MemberProfileDraft,
  onChange: (next: MemberProfileDraft) => void,
  key: keyof MemberProfileDraft,
  next: string,
) {
  onChange({ ...value, [key]: next });
}

export function MemberProfileFields({
  value,
  onChange,
  includeName = true,
  includeCompany = true,
  inputClassName = editorialInput,
}: MemberProfileFieldsProps) {
  const area = `${inputClassName} min-h-24`;
  const label = "text-xs tracking-[0.14em] text-[#8f6f3e]";

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="font-serif text-2xl text-[#1f1a15]">Contact</h2>
        {includeName ? (
          <label className="block space-y-1">
            <span className={label}>FULL NAME</span>
            <input className={inputClassName} value={value.name} onChange={(e) => setField(value, onChange, "name", e.target.value)} />
          </label>
        ) : null}
        <label className="block space-y-1">
          <span className={label}>PHONE</span>
          <input className={inputClassName} value={value.phone} onChange={(e) => setField(value, onChange, "phone", e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className={label}>PREFERRED CONTACT</span>
          <select className={inputClassName} value={value.preferredContact} onChange={(e) => setField(value, onChange, "preferredContact", e.target.value)}>
            {PREFERRED_CONTACT_OPTIONS.map((option) => (
              <option key={option || "unset"} value={option}>{option || "Select"}</option>
            ))}
          </select>
        </label>
        {includeCompany ? (
          <label className="block space-y-1">
            <span className={label}>COMPANY</span>
            <input className={inputClassName} value={value.company} onChange={(e) => setField(value, onChange, "company", e.target.value)} />
          </label>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl text-[#1f1a15]">Address</h2>
        <label className="block space-y-1">
          <span className={label}>STREET</span>
          <input className={inputClassName} value={value.addressLine1} onChange={(e) => setField(value, onChange, "addressLine1", e.target.value)} />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className={label}>CITY</span>
            <input className={inputClassName} value={value.city} onChange={(e) => setField(value, onChange, "city", e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className={label}>STATE</span>
            <input className={inputClassName} value={value.state} onChange={(e) => setField(value, onChange, "state", e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className={label}>POSTAL CODE</span>
            <input className={inputClassName} value={value.postalCode} onChange={(e) => setField(value, onChange, "postalCode", e.target.value)} />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl text-[#1f1a15]">Health</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className={label}>DATE OF BIRTH</span>
            <input className={inputClassName} placeholder="YYYY-MM-DD" value={value.dateOfBirth} onChange={(e) => setField(value, onChange, "dateOfBirth", e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className={label}>SEX AT BIRTH</span>
            <select className={inputClassName} value={value.sexAtBirth} onChange={(e) => setField(value, onChange, "sexAtBirth", e.target.value)}>
              {SEX_AT_BIRTH_OPTIONS.map((option) => (
                <option key={option || "unset"} value={option}>{option || "Select"}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-1">
          <span className={label}>PRIMARY CARE PHYSICIAN</span>
          <input className={inputClassName} value={value.primaryCarePhysician} onChange={(e) => setField(value, onChange, "primaryCarePhysician", e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className={label}>PREGNANCY STATUS</span>
          <select className={inputClassName} value={value.pregnancyStatus} onChange={(e) => setField(value, onChange, "pregnancyStatus", e.target.value)}>
            {PREGNANCY_STATUS_OPTIONS.map((option) => (
              <option key={option || "unset"} value={option}>{option || "Select"}</option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className={label}>MEDICAL CONDITIONS</span>
          <textarea className={area} value={value.medicalConditions} onChange={(e) => setField(value, onChange, "medicalConditions", e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className={label}>ALLERGIES</span>
          <textarea className={area} value={value.allergies} onChange={(e) => setField(value, onChange, "allergies", e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className={label}>MEDICATIONS</span>
          <textarea className={area} value={value.medications} onChange={(e) => setField(value, onChange, "medications", e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className={label}>SUPPLEMENTS AND PEPTIDES</span>
          <textarea className={area} value={value.supplements} onChange={(e) => setField(value, onChange, "supplements", e.target.value)} />
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl text-[#1f1a15]">Emergency contact</h2>
        <label className="block space-y-1">
          <span className={label}>NAME</span>
          <input className={inputClassName} value={value.emergencyContact} onChange={(e) => setField(value, onChange, "emergencyContact", e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className={label}>RELATIONSHIP</span>
          <input className={inputClassName} value={value.emergencyRelationship} onChange={(e) => setField(value, onChange, "emergencyRelationship", e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className={label}>PHONE</span>
          <input className={inputClassName} value={value.emergencyPhone} onChange={(e) => setField(value, onChange, "emergencyPhone", e.target.value)} />
        </label>
      </section>
    </div>
  );
}
