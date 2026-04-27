"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  ShieldCheck,
  Cpu,
  CircuitBoard,
  Trophy,
  Lightbulb,
  Rocket,
  CheckCircle2,
  Calendar,
  Sparkles,
  History,
} from "lucide-react"

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true },
  }

  const coreValues = [
    {
      title: "Precision in Engineering",
      description:
        "We emphasize meticulous attention to detail in every circuit and line of code.",
      icon: <Cpu className="h-6 w-6 text-[#F5A623]" />,
    },
    {
      title: "Structure in Learning",
      description:
        "Our curriculum is designed to build a solid foundation before advancing to complexity.",
      icon: <CircuitBoard className="h-6 w-6 text-[#2E4A7D]" />,
    },
    {
      title: "Innovation in Design",
      description:
        "We encourage creative problem-solving and out-of-the-box thinking.",
      icon: <Lightbulb className="h-6 w-6 text-[#F5A623]" />,
    },
    {
      title: "Excellence in Execution",
      description:
        "We strive for the highest standards in everything we build and teach.",
      icon: <Trophy className="h-6 w-6 text-[#2E4A7D]" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-slate-50 py-12">
        <div className="absolute top-0 right-0 h-full w-1/3 translate-x-1/2 skew-x-12 bg-[#2E4A7D]/5" />
        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-[#2E4A7D]">
              Our Journey
            </h1>
            <div className="mb-6 h-1 w-54 rounded-full bg-[#F5A623]" />
            <p className="mb-8 text-xl font-bold tracking-widest text-red-700 uppercase">
              M&P Didaskalia Advanced Robotics Association
            </p>
            <p className="text-2xl leading-relaxed font-medium text-slate-700 italic">
              &quot;Equipping pioneers to lead our Coptic Church on a global
              level.&quot;
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="container mx-auto px-4 py-18">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-7">
            <motion.div {...fadeIn} className="space-y-6">
              <div className="text-m flex items-center gap-3 font-bold tracking-tighter text-red-800 uppercase">
                <Calendar className="h-5 w-5" />
                <span>Established 2009</span>
              </div>
              <p className="text-xl leading-relaxed font-medium text-slate-700">
                In light of the rapid developments in our daily lives and our
                commitment to keeping up with them, we launched the{" "}
                <span className="font-bold text-[#2E4A7D]">
                  M&P service in 2009
                </span>{" "}
                to support our children and help them grow spiritually,
                academically, and practically.
              </p>
            </motion.div>

            <motion.div
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 text-m font-bold tracking-tighter text-red-800 uppercase">
                <Sparkles className="h-5 w-5" />
                <span>Beyond Technology</span>
              </div>
              <p className="text-xl leading-relaxed text-slate-700">
                Over the years, our service has not only been technical, but has
                focused on equipping boys and girls with essential life skills
                such as{" "}
                <span className="border-b-2 border-[#F5A623]/30 font-semibold text-slate-900">
                  problem-solving
                </span>
                ,{" "}
                <span className="border-b-2 border-[#F5A623]/30 font-semibold text-slate-900">
                  critical thinking
                </span>
                , and the ability to communicate their ideas and creativity.
              </p>
              <p className="text-xl leading-relaxed text-slate-700">
                Our goal has always been to prepare{" "}
                <span className="font-bold text-[#2E4A7D]">
                  true leaders and pioneers
                </span>{" "}
                capable of leading our Coptic Church on a global level.
              </p>
            </motion.div>

            <motion.div
              {...fadeIn}
              transition={{ delay: 0.4 }}
              className="relative overflow-hidden rounded-2xl bg-[#2E4A7D] p-8 text-white shadow-xl shadow-blue-900/20"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Rocket size={120} />
              </div>
              <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                <History className="h-6 w-6 text-[#F5A623]" /> The Next Chapter
              </h3>
              <p className="text-lg leading-relaxed text-blue-100">
                Today, we are taking bigger steps forward in our journey. Stay
                tuned and be part of the next chapter of our story.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="sticky top-24 lg:col-span-5"
          >
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10">
              <h3 className="mb-8 text-2xl font-bold text-slate-900">
                Our Foundation
              </h3>
              <div className="space-y-8">
                {[
                  {
                    label: "Spiritual Growth",
                    icon: <ShieldCheck className="text-emerald-500" />,
                  },
                  {
                    label: "Academic Excellence",
                    icon: <CheckCircle2 className="text-[#2E4A7D]" />,
                  },
                  {
                    label: "Practical Skills",
                    icon: <Cpu className="text-[#F5A623]" />,
                  },
                ].map((item, i) => (
                  <div key={i} className="group flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition-transform group-hover:scale-110">
                      {item.icon}
                    </div>
                    <span className="text-lg font-bold text-slate-800">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-12 border-t border-slate-800 pt-8">
                <p className="font-medium text-red-800 text-center">
                  &quot;Building leaders since 2009.&quot;
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#2E4A7D] via-[#F5A623] to-[#2E4A7D]" />
        <div className="container mx-auto px-4">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-4xl font-bold">Our Core Values</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-400">
              The guiding principles that drive our commitment to excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10"
              >
                <div className="mb-6 w-fit rounded-xl bg-white/5 p-3 transition-transform group-hover:scale-110">
                  {value.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold">{value.title}</h3>
                <p className="leading-relaxed text-slate-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
    </div>
  )
}
