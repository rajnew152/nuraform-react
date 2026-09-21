import FeatureGroup from './FeatureGroup';
import { INTELLIGENCE_GROUP, DESIGN_GROUP } from './featureData';
import './FeatureSection.css';

/** Two feature sliders on the grey band, separated by a hairline rule. */
export default function FeatureSection() {
  return (
    <section className="features">
      <FeatureGroup {...INTELLIGENCE_GROUP} introTitle />
      <hr />
      <FeatureGroup {...DESIGN_GROUP} />
    </section>
  );
}
