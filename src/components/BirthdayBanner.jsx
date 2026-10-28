import React from 'react';
import { formatMonthLabel } from '../utils/formatters.js';
import { parseSheetKey, getEventMeta } from '../utils/sheetHelpers.js';
import { getBabyGiftRecipientName } from '../utils/normalizers.js';

function BirthdayBannerComponent({ birthdayFor, month, eventType, birthdayEmployees }) {
  let names = '';
  const eventMeta = getEventMeta(eventType);
  const monthValue = parseSheetKey(month).birthdayMonth;
  const isBabyGift = eventType === 'babyGift';

  const formatList = (list) => {
    if (list.length === 0) return '';
    if (list.length === 1) return list[0];
    const items = [...list];
    const last = items.pop();
    return `${items.join(', ')} & ${last}`;
  };

  if (birthdayEmployees.length > 0) {
    names = formatList(birthdayEmployees.map((record) => record.name));
  } else {
    const fallbackNames = birthdayFor.split(/,|&|and|\+/).map((n) => n.trim()).filter(Boolean);
    names = formatList(fallbackNames);
  }

  const babyGiftRecipient = getBabyGiftRecipientName(birthdayFor, names);
  const bannerRecipient = isBabyGift ? (babyGiftRecipient || names) : names;

  return (
    <section className="birthday-banner-page">
      <div className="birthday-banner">
        <div className="banner-ribbon">{formatMonthLabel(monthValue)}</div>
        <p className="banner-kicker">
          {isBabyGift
            ? `Team Contribution for ${birthdayFor}`
            : `Team ${eventMeta.name} Contribution`}
        </p>
        <h2>{isBabyGift ? 'Congratulations' : 'Happy Birthday'}</h2>
        <strong>{bannerRecipient}</strong>
        <p className="banner-message">
          {isBabyGift
            ? 'Wishing your family joy, good health, and beautiful new memories ahead.'
            : 'Wishing you joy, success, great health, and a wonderful year ahead.'}
        </p>
        <div className="banner-footer">From all your teammates</div>
      </div>
    </section>
  );
}

export const BirthdayBanner = React.memo(BirthdayBannerComponent);
