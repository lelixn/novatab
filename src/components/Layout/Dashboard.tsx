import Clock from "../Clock/Clock";
import Greeting from "../Greeting/Greeting";
import Quote from "../Quote/Quote";
import SearchBar from "../Search/SearchBar";
import QuickLinks from "../QuickLinks/QuickLinks";
import Todo from "../Todo/Todo";
import Pomodoro from "../Pomodoro/Pomodoro";

export default function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl p-6">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <Greeting />

        <Clock />

      </div>

      {/* Search */}

      <SearchBar />

      {/* Quick Links */}

      <div className="mt-6">
        <QuickLinks />
      </div>

      {/* Widgets */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        <Todo />

        <Pomodoro />

      </div>

      {/* Quote */}

      <div className="mt-8">

        <Quote />

      </div>

    </div>
  );
}