import FeatureGroup from './FeatureGroup';
import TeamSection from '../Team/TeamSection';
import { INTELLIGENCE_GROUP, DESIGN_GROUP } from './featureData';
import './FeatureSection.css';

/** Two feature sliders on the grey band, with the team block between them. */
export default function FeatureSection() {
  return (
    <section className="features">
      <FeatureGroup {...INTELLIGENCE_GROUP} introTitle />
      <TeamSection />
      <FeatureGroup {...DESIGN_GROUP} />
    </section>
  );
}
