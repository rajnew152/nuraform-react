import Intro from './Intro';
import UseCases from './UseCases';
import './About.css';

/** Wraps the pinned pitch and the use-case wheels in the original `.about` section. */
export default function About() {
  return (
    <section className="about">
      <Intro />
      <UseCases />
    </section>
  );
}
