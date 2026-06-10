type Props = {
  innerChild: string;
};

export function ShadowInsight({
  innerChild,
}: Props) {

  return (

    <section className="mt-8">

      <div className="bg-[#F7F4ED] rounded-[32px] p-6 shadow-sm">

        <p className="text-[#A08963] text-sm mb-4">
          🌘 Shadow Insight
        </p>

        <div className="bg-white/50 rounded-3xl p-5">

          <p className="text-[#8B8B7A] text-sm mb-3">
            Inner Reflection
          </p>

          <p className="text-[#4F5E52] leading-[2] text-lg">
            {innerChild}
          </p>

        </div>

      </div>

    </section>

  );

}