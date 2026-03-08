"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Severity = "critical" | "major" | "minor";
type Category = "precision" | "consistency" | "fact" | "tone";

type Issue = {
  code: string;
  severity: Severity;
  category: Category;
  message: string;
  evidence?: string;
};

type StepPayload = {
  pass: boolean;
  issues: Issue[];
  bullets: string[];
  submittedText: string;
  submittedAt: number;
};

function setStep(key: string, payload: StepPayload) {
  window.localStorage.setItem(key, JSON.stringify(payload));
}

export default function ExampleReportSeeder() {
  const router = useRouter();

  useEffect(() => {
    const submittedText =
      "Vi er Nordens mest innovative rådgivningsmiljø og leverer alltid bransjens beste resultater til alle kunder. " +
      "Vår metode er unik og fungerer i alle situasjoner, overalt og til enhver tid.\n\n" +
      "Selskapet ble etablert i 2022 og har vært i kontinuerlig drift siden 2024. I 2024 leverte vi 5 000 prosjekter, " +
      "men totalt siden oppstart har vi levert 3 000 prosjekter. Ifølge en analyse fra Skandinavisk Analyseinstitutt er vi " +
      "rangert som nummer 1 i Europa, og flere studier viser at vi gir 250% bedre effekt enn tradisjonelle løsninger.\n\n" +
      "Vi tilbyr gratis oppstart for alle nye kunder, men oppstart koster samtidig 12 500 kr eks mva. " +
      "Kontakt vår uavhengige ekspertgruppe (intern avdeling) for en vurdering. Vi svarer raskt og profesjonelt!!";

    const now = Date.now();

    setStep("phorium:presisjon", {
      pass: false,
      submittedText,
      submittedAt: now,
      bullets: [],
      issues: [
        {
          code: "PRES_SUPERLATIV_UDOK",
          severity: "major",
          category: "precision",
          message:
            "Påstanden om å være «Nordens mest innovative rådgivningsmiljø» fremstår udokumentert.",
          evidence: "«Vi er Nordens mest innovative rådgivningsmiljø»",
        },
        {
          code: "PRES_ABSOLUTT_ALLTID",
          severity: "major",
          category: "precision",
          message:
            "Absolutt formulering kan ikke etterprøves («i alle situasjoner, overalt og til enhver tid»).",
          evidence: "«fungerer i alle situasjoner, overalt og til enhver tid»",
        },
      ],
    });

    setStep("phorium:konsistens", {
      pass: false,
      submittedText,
      submittedAt: now,
      bullets: [],
      issues: [
        {
          code: "KONS_TALL_MOTSTRID",
          severity: "critical",
          category: "consistency",
          message:
            "Motstridende opplysninger om antall leverte prosjekter (2024 vs total siden oppstart).",
          evidence:
            "«I 2024 leverte vi 5 000 prosjekter, men totalt siden oppstart har vi levert 3 000 prosjekter.»",
        },
        {
          code: "KONS_GRATIS_PRIS",
          severity: "critical",
          category: "consistency",
          message:
            "Oppstart omtales som gratis samtidig som en oppstartspris oppgis.",
          evidence:
            "«Vi tilbyr gratis oppstart … men oppstart koster samtidig 12 500 kr»",
        },
      ],
    });

    setStep("phorium:faktagrunnlag", {
      pass: false,
      submittedText,
      submittedAt: now,
      bullets: [],
      issues: [
        {
          code: "FACT_KILDE_UKJENT",
          severity: "major",
          category: "fact",
          message:
            "Analyseinstituttet er ikke identifisert med kilde/lenke eller dokumentasjon.",
          evidence:
            "«Ifølge en analyse fra Skandinavisk Analyseinstitutt …»",
        },
        {
          code: "FACT_EFFEKT_250",
          severity: "major",
          category: "fact",
          message:
            "Effektpåstand («250% bedre») mangler dokumentasjon og avgrensning.",
          evidence:
            "«flere studier viser at vi gir 250% bedre effekt …»",
        },
      ],
    });

    // Publiseringsklar: kan gjerne være en ren terskelmotor, men her setter vi den eksplisitt.
    setStep("phorium:publiseringsklar", {
      pass: false,
      submittedText,
      submittedAt: now,
      bullets: [],
      issues: [
        {
          code: "PUBL_KRITISK_AVVIK",
          severity: "critical",
          category: "tone",
          message:
            "Teksten vurderes ikke publiseringsklar på grunn av kritiske avvik i konsistens og dokumenterbarhet.",
        },
      ],
    });

    setStep("phorium:tekniskkontroll", {
      pass: false,
      submittedText,
      submittedAt: now,
      bullets: [],
      issues: [
        {
          code: "TEKN_UTROPSTEGN",
          severity: "minor",
          category: "tone",
          message: "Unødvendig dobbel utropstegn.",
          evidence: "«profesjonelt!!»",
        },
      ],
    });

    // Optional: draft (fallback i FinalReport)
    window.localStorage.setItem("phorium:draft", submittedText);

    // Send til den ekte rapportsiden
    router.push("/rapport");
  }, [router]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
        <div className="text-sm text-[var(--phorium-muted)]">
          Klargjør eksempelrapport…
        </div>
      </div>
    </main>
  );
}