'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** QR-code als SVG (in de browser gegenereerd, geen externe dienst). */
export function QrCode({ value, label }: { value: string; label: string }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(value, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#1d2b36', light: '#ffffff' },
    })
      .then((s) => !cancelled && setSvg(s))
      .catch(() => !cancelled && setSvg(null));
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!svg) return <div className="ui-qr" aria-hidden="true" />;
  // De SVG komt uit de qrcode-bibliotheek (alleen paden), niet uit gebruikersinvoer.
  return <div className="ui-qr" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />;
}
