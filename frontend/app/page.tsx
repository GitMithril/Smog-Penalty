'use client'

import { Hero } from "@/components/hero";
import { AboutUs } from "@/components/aboutus";
import { Leva } from "leva";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutUs />
      <Leva hidden />
    </>
  );
}
