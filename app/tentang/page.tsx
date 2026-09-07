"use client";

import React from "react";
import Image from "next/image";
import { AppNav } from "@/components/navigation/AppNav";
import { isEnlEdition } from "@/lib/config/edition";
import {
  Heart,
  Target,
  Zap,
  Compass,
  Moon,
  Leaf,
  Sparkles,
  Users,
  BookOpen,
  Layout
} from "lucide-react";

export default function TentangPage() {
  const isEn = isEnlEdition();
  return (
    <main className="min-h-screen bg-[#FCFAF5] text-[#4F5E52] pb-24 selection:bg-[#9BB89A]/20">
      <AppNav />

      {/* Header Section */}
      <header className="pt-20 pb-12 px-6 text-center max-w-2xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="relative w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center border border-[#E8E9E5]">
            <Image
              src="/images/logo.png"
              alt="Bhumi Amartya Logo"
              width={48}
              height={48}
              className="opacity-90"
            />
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold text-[#4F6658] tracking-tight mb-4">
          {isEn ? "About Bhumi Amartya" : "Tentang Bhumi Amartya"}
        </h1>
        <div className="w-12 h-px bg-[#9BB89A] mx-auto opacity-50" />
      </header>

      <div className="max-w-xl mx-auto px-6 space-y-12">

        {/* Intro Section */}
        <section className="space-y-6 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-sm border border-[#E8E9E5] text-[#9BB89A] mb-2">
            <Layout size={24} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#4F6658]">
            {isEn ? "A Home to Return and Know Yourself" : "Rumah untuk Pulang dan Mengenali Diri"}
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-[#7B8776] font-medium">
            {isEn ? (
              <>
                <p>Each person walks a unique life journey.</p>
                <p>Behind every experience, challenge, relationship, career, dream, and wound we have ever lived through, there are patterns that shape who we are today.</p>
                <p>Bhumi Amartya is here to help you understand these patterns in a simple, personal, and grounded way.</p>
                <p>This app is dedicated to the Residents of Bhumi, those who are growing, learning to know themselves, and tending to their awareness every day.</p>
              </>
            ) : (
              <>
                <p>Setiap orang memiliki perjalanan hidup yang unik.</p>
                <p>Di balik pengalaman, tantangan, hubungan, pekerjaan, mimpi, dan luka yang pernah dialami, terdapat pola yang membentuk siapa diri kita hari ini.</p>
                <p>Bhumi Amartya hadir untuk membantu kamu memahami pola tersebut dengan cara yang sederhana, personal, dan membumi.</p>
                <p>Aplikasi ini dipersembahkan untuk para Penghuni Bhumi, mereka yang sedang bertumbuh, belajar mengenali diri, dan merawat kesadarannya setiap hari.</p>
              </>
            )}
          </div>
        </section>

        <hr className="border-[#E8E9E5]" />

        {/* What is Bhumi */}
        <section className="bhumi-card bg-white p-8 space-y-6 shadow-sm border-none">
          <div className="flex items-center gap-4 text-[#4F6658]">
            <div className="p-2.5 rounded-xl bg-[#FCFAF5] border border-[#E8E9E5]">
              <Compass size={22} />
            </div>
            <h2 className="text-xl font-serif font-bold">{isEn ? "What Is Bhumi Amartya?" : "Apa Itu Bhumi Amartya?"}</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-[#7B8776] font-medium">
            {isEn ? (
              <>
                <p>Bhumi Amartya is a reflection and self-development app that helps you know yourself, understand the life phase you are living through, and find steps that are more aligned each day.</p>
                <p>Bhumi processes a range of self-knowledge and personal growth approaches into daily guidance that is easy to understand and apply.</p>
                <p>You do not need to study any complicated systems.</p>
                <p className="text-[#4F6658] font-bold">Let Bhumi work to transform complexity into clarity.</p>
                <p>Behind the scenes, Bhumi processes personal data to help bring forward reflection, insight, and guidance that is more relevant for every Resident of Bhumi.</p>
                <p>You do not need to understand all of that process.</p>
                <p>Simply focus on your journey, while Bhumi helps map the way.</p>
              </>
            ) : (
              <>
                <p>Bhumi Amartya adalah aplikasi refleksi dan pengembangan diri yang membantu kamu mengenali diri, memahami fase kehidupan yang sedang dijalani, serta menemukan langkah yang lebih selaras setiap hari.</p>
                <p>Bhumi mengolah berbagai pendekatan pengenalan diri dan pertumbuhan personal menjadi panduan harian yang mudah dipahami dan diterapkan.</p>
                <p>Kamu tidak perlu mempelajari berbagai sistem yang rumit.</p>
                <p className="text-[#4F6658] font-bold">Biarkan Bhumi bekerja mengolah kompleksitas menjadi kejelasan.</p>
                <p>Di balik layar, Bhumi mengolah berbagai data personal untuk membantu menghadirkan refleksi, wawasan, dan panduan yang lebih relevan bagi setiap Penghuni Bhumi.</p>
                <p>Kamu tidak perlu memahami semua proses tersebut.</p>
                <p>Cukup fokus pada perjalananmu, sementara Bhumi membantu menyusun petanya.</p>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-8">
          <div className="text-center mb-8">
             <h2 className="text-xl font-serif font-bold text-[#4F6658]">{isEn ? "What Will You Find?" : "Apa yang Akan Kamu Temukan?"}</h2>
          </div>

          <div className="grid gap-4">
            {(isEn ? [
              { icon: Leaf, title: "Soul Reflection", desc: "Helps you recognize your core patterns, strengths, challenges, and life lessons.", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: Moon, title: "Daily Astro", desc: "Helps you understand the energy and themes currently active in your life.", color: "text-indigo-500", bg: "bg-indigo-50" },
              { icon: Compass, title: "Today's Note", desc: "Helps translate your condition and today's context into relevant guidance.", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: Heart, title: "Today's Innerwork", desc: "Helps you find small steps you can take for real, tangible growth.", color: "text-rose-500", bg: "bg-rose-50" },
              { icon: Sparkles, title: "Today's Manifestation", desc: "Helps align your thoughts, beliefs, and actions with the direction of growth you are pursuing.", color: "text-amber-500", bg: "bg-amber-50" },
            ] : [
              { icon: Leaf, title: "Refleksi Jiwa", desc: "Membantu mengenali pola dasar, kekuatan, tantangan, dan pelajaran hidupmu.", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: Moon, title: "Astro Hari Ini", desc: "Membantu memahami energi dan tema yang sedang aktif dalam hidupmu saat ini.", color: "text-indigo-500", bg: "bg-indigo-50" },
              { icon: Compass, title: "Catatan Hari Ini", desc: "Membantu menerjemahkan kondisi dirimu dan konteks hari ini menjadi panduan yang relevan.", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: Heart, title: "Innerwork Hari Ini", desc: "Membantu menemukan langkah kecil yang dapat dilakukan untuk bertumbuh secara nyata.", color: "text-rose-500", bg: "bg-rose-50" },
              { icon: Sparkles, title: "Manifestasi Hari Ini", desc: "Membantu menyelaraskan pikiran, keyakinan, dan tindakan dengan arah pertumbuhan yang sedang kamu jalani.", color: "text-amber-500", bg: "bg-amber-50" },
            ]).map((item, idx) => (
              <div key={idx} className="flex gap-4 p-5 rounded-3xl bg-white shadow-sm border border-[#E8E9E5]/50 group hover:shadow-md transition-all duration-300">
                <div className={`shrink-0 p-3 rounded-2xl ${item.bg} ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#4F6658] mb-1">{item.title}</h3>
                  <p className="text-xs text-[#7B8776] leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="bg-[#4F5E52] p-10 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 text-white/5 group-hover:scale-110 transition-transform duration-1000">
            <BookOpen size={200} />
          </div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl font-serif font-bold">{isEn ? "The Philosophy of Bhumi" : "Filosofi Bhumi"}</h2>
            <div className="space-y-4 text-sm leading-relaxed opacity-90 font-medium">
              {isEn ? (
                <>
                  <p>We believe everyone has a unique life map.</p>
                  <p>But a complicated map does not always help.</p>
                  <p>That is why Bhumi is here to simplify a wide range of information into insight that is easier to understand and apply in everyday life.</p>
                  <p>Bhumi's purpose is not to predict the future.</p>
                  <p>Bhumi's purpose is to help Residents of Bhumi understand themselves, recognize their life patterns, and walk life more consciously.</p>
                </>
              ) : (
                <>
                  <p>Kami percaya bahwa setiap orang memiliki peta hidup yang unik.</p>
                  <p>Namun peta yang rumit tidak selalu membantu.</p>
                  <p>Karena itu Bhumi hadir untuk menyederhanakan berbagai informasi menjadi wawasan yang lebih mudah dipahami dan diterapkan dalam kehidupan sehari-hari.</p>
                  <p>Tujuan Bhumi bukan untuk meramal masa depan.</p>
                  <p>Tujuan Bhumi adalah membantu para Penghuni Bhumi memahami dirinya, mengenali pola hidupnya, dan menjalani perjalanan hidup dengan lebih sadar.</p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Penghuni Bhumi Section */}
        <section className="space-y-6 px-4">
          <div className="flex items-center gap-4 text-[#4F6658]">
            <div className="p-2.5 rounded-xl bg-white border border-[#E8E9E5] shadow-sm">
              <Users size={22} />
            </div>
            <h2 className="text-xl font-serif font-bold">{isEn ? "Who Is a Resident of Bhumi?" : "Siapa Itu Penghuni Bhumi?"}</h2>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-[#7B8776] font-medium">
            {isEn ? (
              <>
                <p>Anyone who chooses to keep learning, growing, and knowing themselves is a Resident of Bhumi.</p>
                <p>Not those who are already perfect.</p>
                <p>Rather, those who are willing to take small steps, day by day.</p>
                <p>Residents of Bhumi understand that great change is born from small awareness practiced consistently.</p>
              </>
            ) : (
              <>
                <p>Penghuni Bhumi adalah setiap orang yang memilih untuk terus belajar, bertumbuh, dan mengenali dirinya.</p>
                <p>Bukan mereka yang sudah sempurna.</p>
                <p>Melainkan mereka yang bersedia melangkah sedikit demi sedikit setiap hari.</p>
                <p>Penghuni Bhumi memahami bahwa perubahan besar lahir dari kesadaran kecil yang dilakukan secara konsisten.</p>
              </>
            )}
          </div>
        </section>

        {/* Vision Section */}
        <section className="bhumi-card bg-[#F5F1E8] border-none p-8 space-y-4 text-center">
          <div className="inline-flex p-3 rounded-full bg-white text-emerald-600 mb-2 shadow-sm">
            <Target size={24} />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#4F6658]">{isEn ? "Vision" : "Visi"}</h2>
          <p className="text-base text-[#7B8776] font-medium leading-relaxed italic px-4">
            {isEn
              ? "A space for more Residents of Bhumi to live consciously, grow, and recognize their own way home."
              : "Menjadi ruang bagi lebih banyak Penghuni Bhumi untuk hidup dengan sadar, bertumbuh, dan mengenali jalan pulangnya sendiri."}
          </p>
        </section>

        {/* Developer Section */}
        <section className="space-y-6 px-4">
          <div className="flex items-center gap-4 text-[#4F6658]">
             <div className="p-2.5 rounded-xl bg-white border border-[#E8E9E5] shadow-sm">
              <Zap size={22} />
            </div>
            <h2 className="text-xl font-serif font-bold">{isEn ? "About the Developer" : "Tentang Pengembang"}</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-[#7B8776] font-medium">
            {isEn ? (
              <>
                <p>Bhumi Amartya is an application developed by the Amartya Creative Team.</p>
                <p>The Amartya Creative Team focuses on developing digital products, education, self-reflection, and technology that help people grow more consciously, creatively, and meaningfully.</p>
              </>
            ) : (
              <>
                <p>Bhumi Amartya merupakan aplikasi yang dikembangkan oleh Amartya Creative Team.</p>
                <p>Amartya Creative Team berfokus pada pengembangan produk digital, edukasi, refleksi diri, dan teknologi yang membantu manusia bertumbuh secara lebih sadar, kreatif, dan bermakna.</p>
              </>
            )}
          </div>
        </section>

        <hr className="border-[#E8E9E5]" />

        {/* Quote & Footer Section */}
        <footer className="pt-4 pb-12 space-y-12 text-center">
          <blockquote className="space-y-4">
            <div className="text-[#9BB89A] flex justify-center opacity-30">
              <Sparkles size={40} />
            </div>
            <p className="text-lg font-serif font-medium text-[#4F6658] leading-relaxed italic px-4">
              {isEn ? (
                <>&quot;The journey of self-knowledge is not about knowing everything.<br />It is about understanding yourself a little better each day.&quot;</>
              ) : (
                <>&quot;Perjalanan mengenal diri bukan tentang mengetahui segalanya.<br />Tetapi tentang memahami diri sedikit lebih baik setiap hari.&quot;</>
              )}
            </p>
          </blockquote>

          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-bold text-[#4F6658]">Bhumi Amartya</h3>
            <p className="text-sm font-medium text-[#7B8776] tracking-wide">{isEn ? "A Home to Return and Know Yourself" : "Rumah untuk Pulang dan Mengenali Diri"}</p>
            <p className="text-xs font-bold text-[#9BB89A] uppercase tracking-[0.2em] pt-4">
              {isEn ? "For the Residents of Bhumi" : "Untuk Para Penghuni Bhumi"}
            </p>
          </div>
        </footer>

      </div>
    </main>
  );
}
