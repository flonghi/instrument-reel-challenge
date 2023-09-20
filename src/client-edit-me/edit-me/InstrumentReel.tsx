/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import { useEffect, useState } from 'react';
import { Instrument, InstrumentSymbol } from '../../common-leave-me';
import { InstrumentSocketClient } from './InstrumentSocketClient';
import './InstrumentReel.css';
import { calculateDelta, formatDelta, getInstrumentLogoPath } from './utils';

export interface InstrumentEnriched extends Instrument {
  delta: number;
}

/**
 * ❌ Please do not edit this
 */
const client = new InstrumentSocketClient();

/**
 * ❌ Please do not edit this hook name & args
 */
function useInstruments(instrumentSymbols: InstrumentSymbol[]) {
  /**
   * ✅ You can edit inside the body of this hook
   */
  const [socketData, setSocketData] = useState<InstrumentEnriched[]>([]);

  useEffect(() => {
    return client.subscribe(instrumentSymbols, (instruments: Instrument[]) => {
      const newValues = instruments.map((instrument) => {
        const oldInstrument = socketData.find(
          (inst) => inst.code === instrument.code
        );
        const delta = oldInstrument
          ? calculateDelta(oldInstrument.lastQuote, instrument.lastQuote)
          : 0;

        return { ...instrument, delta };
      });
      setSocketData(newValues);
    });
  }, [instrumentSymbols, setSocketData, socketData]);

  return socketData;
}

interface InstrumentDetailProps {
  instrument: InstrumentEnriched;
}
function InstrumentDetail({ instrument }: InstrumentDetailProps) {
  const { category, code, delta, lastQuote, name } = instrument;
  const logoPath = getInstrumentLogoPath(category, code);

  const quoteClass = delta === 0 ? '' : delta > 0 ? 'gain' : 'loss';
  return (
    <div className="instrument__detail">
      <span className="instrument__name">
        <img className="instrument__logo" src={logoPath} /> {name}
      </span>{' '}
      <span className={`instrument__last_quote ${quoteClass}`}>
        {lastQuote.toFixed(2)}
      </span>{' '}
      <span className={`instrument__delta ${quoteClass}`}>
        {formatDelta(delta)}%
      </span>
    </div>
  );
}

export interface InstrumentReelProps {
  instrumentSymbols: InstrumentSymbol[];
}

function InstrumentReel({ instrumentSymbols }: InstrumentReelProps) {
  /**
   * ❌ Please do not edit this
   */
  const instruments = useInstruments(instrumentSymbols);

  /**
   * ✅ You can edit from here down in this component.
   * Please feel free to add more components to this file or other files if you want to.
   */

  return (
    <div className="enable-animation reel__container">
      {instruments.length > 0 && (
        <div className="marquee">
          <ul className="marquee__content">
            {instruments.map((instrument) => (
              <li key={instrument.code}>
                <InstrumentDetail instrument={instrument} />
              </li>
            ))}
          </ul>
          <ul className="marquee__content" aria-hidden="true">
            {instruments.map((instrument) => (
              <li key={instrument.code}>
                <InstrumentDetail instrument={instrument} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default InstrumentReel;
