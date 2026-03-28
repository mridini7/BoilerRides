export default function ReportScreen() {
  return (
    <div className="screen-enter flex flex-col flex-1 pb-24 px-5">
      <div className="pt-10 pb-6">
        <h1 className="font-heading font-black text-2xl text-white">Report an Issue</h1>
      </div>
      <div className="card p-6 flex flex-col items-center text-center gap-4">
        <span className="text-5xl">🚩</span>
        <h2 className="font-heading font-bold text-xl text-gray-800">Need Help?</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Contact Purdue Campus Connect directly for urgent ride or reservation issues.
        </p>
        <a href="tel:7655550192"
          className="btn-gold flex items-center justify-center gap-2 no-underline"
          style={{ textDecoration: 'none' }}>
          📞 (765) 555-0192
        </a>
        <p className="text-xs text-gray-400">Available Mon–Fri, 8am–6pm EST</p>
      </div>
    </div>
  )
}
