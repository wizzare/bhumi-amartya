"use client";

import React from "react";
import Image from "next/image";
import { AppNav } from "@/components/navigation/AppNav";
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
          Tentang Bhumi Amartya
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
            Rumah untuk Pulang dan Mengenali Diri
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-[#7B8776] font-medium">
            <p>Setiap orang memiliki perjalanan hidup yang unik.</p>
            <p>Di balik pengalaman, tantangan, hubungan, pekerjaan, mimpi, dan luka yang pernah dialami, terdapat pola yang membentuk siapa diri kita hari ini.</p>
            <p>Bhumi Amartya hadir untuk membantu kamu memahami pola tersebut dengan cara yang sederhana, personal, dan membumi.</p>
            <p>Aplikasi ini dipersembahkan untuk para Penjaga Bhumi — mereka yang sedang bertumbuh, belajar mengenali dirinya, merawat kesadarannya, dan berusaha menghadirkan manfaat bagi diri sendiri, keluarga, lingkungan, serta kehidupan yang lebih luas.</p>
          </div>
        </section>

        <hr className="border-[#E8E9E5]" />

        {/* What is Bhumi */}
        <section className="bhumi-card bg-white p-8 space-y-6 shadow-sm border-none">
          <div className="flex items-center gap-4 text-[#4F6658]">
            <div className="p-2.5 rounded-xl bg-[#FCFAF5] border border-[#E8E9E5]">
              <Compass size={22} />
            </div>
            <h2 className="text-xl font-serif font-bold">Apa Itu Bhumi Amartya?</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-[#7B8776] font-medium">
            <p>Bhumi Amartya adalah aplikasi refleksi dan pengembangan diri yang membantu kamu mengenali diri, memahami fase kehidupan yang sedang dijalani, serta menemukan langkah yang lebih selaras setiap hari.</p>
            <p>Bhumi mengolah berbagai pendekatan pengenalan diri dan pertumbuhan personal menjadi panduan harian yang mudah dipahami dan diterapkan.</p>
            <p>Kamu tidak perlu mempelajari berbagai sistem yang rumit.</p>
            <p className="text-[#4F6658] font-bold">Biarkan Bhumi bekerja mengolah kompleksitas menjadi kejelasan.</p>
            <p>Di balik layar, Bhumi mengolah berbagai data personal untuk membantu menghadirkan refleksi, wawasan, dan panduan yang lebih relevan bagi setiap Penjaga Bhumi.</p>
            <p>Kamu tidak perlu memahami semua proses tersebut.</p>
            <p>Cukup fokus pada perjalananmu, sementara Bhumi membantu menyusun petanya.</p>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-8">
          <div className="text-center mb-8">
             <h2 className="text-xl font-serif font-bold text-[#4F6658]">Apa yang Akan Kamu Temukan?</h2>
          </div>

          <div className="grid gap-4">
            {[
              { icon: Leaf, title: "Refleksi Jiwa", desc: "Membantu mengenali pola dasar, kekuatan, tantangan, dan pelajaran hidupmu.", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: Moon, title: "Astro Hari Ini", desc: "Membantu memahami energi dan tema yang sedang aktif dalam hidupmu saat ini.", color: "text-indigo-500", bg: "bg-indigo-50" },
              { icon: Compass, title: "Catatan Hari Ini", desc: "Membantu menerjemahkan kondisi dirimu dan konteks hari ini menjadi panduan yang relevan.", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: Heart, title: "Innerwork Hari Ini", desc: "Membantu menemukan langkah kecil yang dapat dilakukan untuk bertumbuh secara nyata.", color: "text-rose-500", bg: "bg-rose-50" },
              { icon: Sparkles, title: "Manifestasi Hari Ini", desc: "Membantu menyelaraskan pikiran, keyakinan, dan tindakan dengan arah pertumbuhan yang sedang kamu jalani.", color: "text-amber-500", bg: "bg-amber-50" },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-5 rounded-3xl bg-white shadow-sm border border-[#E8E9E5]/50 group hover:shadow-md transition-all duration-300">
                <div className={`shrink-0 p-3 rounded-2xl ${item.bg} ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#4F6658] mb-1">🌱 {item.title}</h3>
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
            <h2 className="text-2xl font-serif font-bold">Filosofi Bhumi</h2>
            <div className="space-y-4 text-sm leading-relaxed opacity-90 font-medium">
              <p>Kami percaya bahwa setiap orang memiliki peta hidup yang unik.</p>
              <p>Namun peta yang rumit tidak selalu membantu.</p>
              <p>Karena itu Bhumi hadir untuk menyederhanakan berbagai informasi menjadi wawasan yang lebih mudah dipahami dan diterapkan dalam kehidupan sehari-hari.</p>
              <p>Tujuan Bhumi bukan untuk meramal masa depan.</p>
              <p>Tujuan Bhumi adalah membantu para Penjaga Bhumi memahami dirinya, mengenali pola hidupnya, dan menjalani perjalanan hidup dengan lebih sadar.</p>
            </div>
          </div>
        </section>

        {/* Penjaga Bhumi Section */}
        <section className="space-y-6 px-4">
          <div className="flex items-center gap-4 text-[#4F6658]">
            <div className="p-2.5 rounded-xl bg-white border border-[#E8E9E5] shadow-sm">
              <Users size={22} />
            </div>
            <h2 className="text-xl font-serif font-bold">Siapa Itu Penjaga Bhumi?</h2>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-[#7B8776] font-medium">
            <p>Penjaga Bhumi adalah setiap orang yang memilih untuk terus belajar, bertumbuh, dan mengenali dirinya.</p>
            <p>Bukan mereka yang sudah sempurna.</p>
            <p>Melainkan mereka yang bersedia melangkah sedikit demi sedikit setiap hari.</p>
            <p>Penjaga Bhumi memahami bahwa perubahan besar lahir dari kesadaran kecil yang dilakukan secara konsisten.</p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="bhumi-card bg-[#F5F1E8] border-none p-8 space-y-4 text-center">
          <div className="inline-flex p-3 rounded-full bg-white text-emerald-600 mb-2 shadow-sm">
            <Target size={24} />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#4F6658]">Visi</h2>
          <p className="text-base text-[#7B8776] font-medium leading-relaxed italic px-4">
            Membantu melahirkan lebih banyak Penjaga Bhumi yang sadar, bertumbuh, dan mampu menjadi cahaya bagi dirinya sendiri maupun lingkungan sekitarnya.
          </p>
        </section>

        {/* Developer Section */}
        <section className="space-y-6 px-4">
          <div className="flex items-center gap-4 text-[#4F6658]">
             <div className="p-2.5 rounded-xl bg-white border border-[#E8E9E5] shadow-sm">
              <Zap size={22} />
            </div>
            <h2 className="text-xl font-serif font-bold">Tentang Pengembang</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-[#7B8776] font-medium">
            <p>Bhumi Amartya merupakan aplikasi yang dikembangkan oleh Amartya Creative Team.</p>
            <p>Amartya Creative Team berfokus pada pengembangan produk digital, edukasi, refleksi diri, dan teknologi yang membantu manusia bertumbuh secara lebih sadar, kreatif, dan bermakna.</p>
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
              "Perjalanan mengenal diri bukan tentang mengetahui segalanya.<br />Tetapi tentang memahami diri sedikit lebih baik setiap hari."
            </p>
          </blockquote>

          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-bold text-[#4F6658]">Bhumi Amartya</h3>
            <p className="text-sm font-medium text-[#7B8776] tracking-wide">Rumah untuk Pulang dan Mengenali Diri</p>
            <p className="text-xs font-bold text-[#9BB89A] uppercase tracking-[0.2em] pt-4">
              🌱 Untuk Para Penjaga Bhumi
            </p>
          </div>
        </footer>

      </div>
    </main>
  );
}
