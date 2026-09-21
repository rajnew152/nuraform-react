import SectionTitle from '../SectionTitle/SectionTitle';
import CtaButton from '../CtaButton/CtaButton';

/**
 * Closing call to action. It lives inside the footer in the original markup and
 * inherits its spacing from `.footer .__cta`, so it ships no stylesheet of its own.
 */
export default function CTA() {
  return (
    <div className="__cta">
      <SectionTitle
        heading="Your leads are calling right now. Who’s picking up?"
        description="The businesses that move first win. Put Better Pitch on your phone lines and never miss another deal."
      />
      <CtaButton href="/demo">Book a Free Demo</CtaButton>
    </div>
  );
}
