/** Small, distinct wayfinding symbols for the four learning directions. */
export function CourseSymbol({ number }: { number: string }) {
  return <svg className="course-symbol" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    {number === '01' ? <><circle cx="24" cy="24" r="17"/><ellipse cx="24" cy="24" rx="8" ry="17"/><path d="M7 24h34M10 14h28M10 34h28"/></>
      : number === '02' ? <><circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="10"/><path d="m18 30 18-18m-9 0h9v9" strokeWidth="2.5"/><circle cx="24" cy="24" r="2" fill="currentColor" stroke="none"/></>
      : number === '03' ? <><path d="M7 9h27v20H19l-9 7v-7H7V9Z"/><path d="M34 17h7v22h-7l-7 5v-5H19v-5M14 17h13M14 22h8"/></>
      : <><path d="M7 7h34v34H7zM7 22h18V7M25 22v19M32 31h9M13 30v5h5"/><path d="m31 13 4 4m0-4-4 4"/></>}
  </svg>;
}
