import SectionTitle from '../SectionTitle/SectionTitle';
import IntroTitle from './IntroTitle';
import FeatureCard from './FeatureCard';

/**
 * A section header above a horizontally scrollable track. `data-speed`/`data-lag`
 * are read by ScrollSmoother; the track itself is a native overflow scroller so
 * trackpads and touch both work without extra JS. `introTitle` swaps the header
 * for the About-intro style word fade with the zooming glyph behind it.
 */
export default function FeatureGroup({ subtitle, heading, description, features, introTitle = false }) {
  const Title = introTitle ? IntroTitle : SectionTitle;

  return (
    <div>
      <Title
        hasPadding
        subtitle={subtitle}
        heading={heading}
        description={description}
      />
      <div className="features__slider" data-speed="1" data-lag="0">
        <div className="--track">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}
