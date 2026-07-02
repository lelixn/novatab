import Greeting from "./Greeting";
import Clock from "./Clock";
import DateDisplay from "./DateDisplay";
import WeatherChip from "./WeatherChip";

export default function Hero() {
  return (
    <section className="flex items-center justify-between">

      <div>

        <Greeting />

        <WeatherChip />

      </div>

      <div>

        <Clock />

        <DateDisplay />

      </div>

    </section>
  );
}