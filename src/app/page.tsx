import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="h-full w-full flex flex-col justify-center items-center">
      <h1 className="font-bold text-xl mb-2">RoofRay</h1>
      <Link href="/dashboard">Explore the solar map</Link>
    </main>
  );
}
