'use client';

import { useRouter } from 'next/navigation';
import AddExercise from '@/app/components/Forms/AddExercise';
export default function Home() {
  const router = useRouter();

  const sections = [
    {
      title: 'Plan treningowy',
      description: 'Twórz i zarządzaj swoimi planami treningowymi.',
      icon: '📅',
      path: '/plans',
    },
    {
      title: 'Historia treningów',
      description: 'Przeglądaj wykonane treningi, serie oraz rekordy.',
      icon: '🏋️',
      path: '/workouts',
    },
    {
      title: 'Statystyki',
      description: 'Analizuj progres, objętość i wyniki.',
      icon: '📊',
      path: '/statistics',
    },
    {
      title: 'Community Feed',
      description: 'Obserwuj rozwój siły i regularności.',
      icon: '📈',
      path: '/social',
    },
  ];

  return (
    <div>
      {/* WELCOME */}
      <section className="mb-10">
        <h1 className="
          text-4xl
          md:text-5xl
          font-bold
          mb-3
        ">
          Witaj ponownie 👋
        </h1>

        <p className="
          text-gray-400
          text-lg
        ">
          Śledź progres, planuj treningi i buduj swoją siłę.
        </p>
      </section>

      {/* QUICK STATS */}
      <section className="
        grid
        grid-cols-2
        lg:grid-cols-4
        gap-5
        mb-12
      ">
        <StatCard value="86" label="Treningów" />
        <StatCard value="42h" label="Czas treningu" />
        <StatCard value="18T" label="Podniesiony ciężar" />
        <StatCard value="12" label="Rekordów" />
      </section>

      {/* MAIN CARDS */}
      <section className="
        grid
        md:grid-cols-2
        gap-6
      ">
        {sections.map(item => (
          <div
            key={item.title}
            onClick={() => router.push(item.path)}
            className="
              group
              cursor-pointer
              rounded-3xl
              border
              border-neutral-800
              bg-gradient-to-br
              from-[#202428]
              to-[#151719]
              p-8
              transition-all
              duration-300
              hover:-translate-y-2
              hover:border-yellow-400
              hover:shadow-[0_20px_50px_rgba(250,204,21,0.12)]
            "
          >
            <div className="text-5xl mb-6">
              {item.icon}
            </div>

            <h2 className="text-2xl font-bold mb-3">
              {item.title}
            </h2>

            <p className="
              text-gray-400
              leading-relaxed
              mb-8
            ">
              {item.description}
            </p>

            <button className="
              rounded-xl
              bg-yellow-400
              px-5
              py-3
              font-bold
              text-black
              transition
              group-hover:bg-yellow-300
            ">
              Otwórz →
            </button>
          </div>
        ))}
      </section>

      {/* RECENT ACTIVITY */}
      <section className="
        mt-10
        rounded-3xl
        border
        border-neutral-800
        bg-[#1b1e21]
        p-8
      ">
        <h2 className="text-2xl font-bold mb-6">
          Ostatnia aktywność
        </h2>

        <WorkoutRow name="Push Day" time="72 min" />
        <WorkoutRow name="Pull Day" time="65 min" />
        <WorkoutRow name="Leg Day" time="80 min" />
      </section>
      <AddExercise />
    </div>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="
      rounded-2xl
      border
      border-neutral-800
      bg-[#1b1e21]
      p-6
    ">
      <h2 className="
        text-3xl
        font-bold
        text-yellow-400
      ">
        {value}
      </h2>

      <p className="
        mt-2
        text-gray-400
      ">
        {label}
      </p>
    </div>
  );
}

function WorkoutRow({
  name,
  time,
}: {
  name: string;
  time: string;
}) {
  return (
    <div className="
      flex
      justify-between
      border-b
      border-neutral-800
      py-4
      last:border-none
    ">
      <span>{name}</span>

      <span className="
        text-yellow-400
        font-semibold
      ">
        {time}
      </span>
    </div>
  );
}