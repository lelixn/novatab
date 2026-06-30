export default function Stars() {

  const stars = Array.from({ length: 80 });

  return (
    <>
      {stars.map((_, i) => (

        <span
          key={i}
          className="absolute rounded-full bg-white"

          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random(),
          }}
        />

      ))}
    </>
  );
}