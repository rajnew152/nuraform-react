import { useRef } from 'react';
import { useSplitTextEffect } from '../../hooks/useSplitTextEffect';
import './SectionTitle.css';

/**
 * Subtitle / heading / description trio shared by every section header.
 * The heading carries the split-word scroll reveal (`data-text-effect`
 * in the original markup).
 */
export default function SectionTitle({ subtitle, heading, description, hasPadding = false }) {
  const headingRef = useRef(null);
  useSplitTextEffect(headingRef);

  return (
    <section className={`section-title${hasPadding ? ' has-padding' : ''}`}>
      {subtitle && <p className="section-title__subtitle">{subtitle}</p>}
      {heading && (
        <h2 ref={headingRef} data-text-effect className="section-title__heading">
          {heading}
        </h2>
      )}
      {description && <h4 className="section-title__description">{description}</h4>}
    </section>
  );
}
