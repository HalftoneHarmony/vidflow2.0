import { notFound } from "next/navigation";
import { getPackageWithShowcase } from "@/features/showcase/queries";
import { ShowcaseDetailClient } from "@/features/showcase/components";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ShowcaseDetailPage({ params }: Props) {
    const { id } = await params;
    const packageData = await getPackageWithShowcase(Number(id));

    if (!packageData) {
        notFound();
    }

    return <ShowcaseDetailClient packageData={packageData} />;
}
