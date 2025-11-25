'use client';

import React from 'react';

export default function ApplyButton() {
  const subject = encodeURIComponent('FragView Editor Application');
  const body = encodeURIComponent(
    `Hi FragView Team,

I am interested in applying to become an editor for The Drydown.

My Username: [Enter Username]
Experience Level: [Master/Expert]

[Please share links to your writing samples or best reviews here]`
  );

  const mailtoLink = `mailto:info@fragview.com?subject=${subject}&body=${body}`;

  return (
    <a
      href={mailtoLink}
      className="relative z-10 inline-block px-8 py-4 bg-white text-green-800 rounded-full font-bold text-base shadow-lg hover:bg-green-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center no-underline"
    >
      Apply to be an Editor
    </a>
  );
}