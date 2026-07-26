import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary-container selection:text-white min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant h-16 flex items-center">
        <div className="max-w-container-max mx-auto w-full px-lg flex justify-between items-center">
          <div className="flex items-center gap-xl">
            <Link className="text-headline-md font-headline font-bold text-primary" to="/">SupplyChain+</Link>
            <div className="hidden md:flex gap-lg">
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#features">Features</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#how-it-works">How it Works</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#testimonials">Testimonials</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#faq">FAQ</a>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button 
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors px-md py-sm"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#e9edff]/40 to-white relative overflow-hidden py-24 md:py-32 border-b border-outline-variant text-left">
          <div className="max-w-container-max mx-auto px-lg grid md:grid-cols-2 gap-xl items-center">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm mb-6 uppercase tracking-wider">Blockchain Verified</span>
              <h1 className="font-headline text-5xl font-bold text-on-surface leading-tight mb-6">
                Revolutionizing Supply Chain <span className="text-primary">Transparency</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-lg">
                Empowering women-owned businesses with blockchain-verified trust. Secure, scalable, and built for the modern enterprise.
              </p>
              <div className="flex flex-wrap gap-md">
                <button 
                  className="bg-primary text-on-primary px-lg py-md rounded-lg font-headline text-[16px] font-semibold shadow-lg hover:opacity-90 transition-all flex items-center gap-sm"
                  onClick={handleGetStarted}
                >
                  Get Started
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <a 
                  className="bg-surface-container-lowest text-on-surface-variant border border-outline-variant px-lg py-md rounded-lg font-headline text-[16px] font-semibold hover:bg-surface-container-low transition-all text-center"
                  href="#features"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="glass-card rounded-xl p-6 shadow-xl relative z-10">
                <img 
                  className="w-full rounded-lg aspect-[4/3] object-cover" 
                  alt="Supply chain network illustration" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYZVGurtm0a9ptNaqICKsuSzC0ZjYDEXM8hCdezBayGoD-2i-A7ogQr7CETV_th66U8dpk3IRdUhQeOMdp5AQ6Qu0EV866djEmf7dNz8tFJ_0ypHM1bZm7v4yf_pgp9aWLdMvdefooGxWBclZUkkOC1gfQLLCwM91oHAe3voXc_d6_U0K1ZLX4ggmBO38erWcrD9dQc40MIw8MDN2SzDds14J2QTy51DatDbggPLC0QSSr0A_KbbYx620mJb6ZeGdgQ-66m6kPXJk"
                />
              </div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-fixed opacity-20 blur-3xl rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-12 bg-surface-container-lowest border-b border-outline-variant">
          <div className="max-w-container-max mx-auto px-lg">
            <p className="text-center font-label-sm text-label-sm text-outline mb-8 uppercase tracking-widest">Trusted by leading global organizations</p>
            <div className="flex flex-wrap justify-center items-center gap-xl grayscale opacity-60">
              <div className="h-8 w-32 bg-outline-variant rounded flex items-center justify-center font-bold text-on-surface-variant">LOGISTICS CO</div>
              <div className="h-8 w-32 bg-outline-variant rounded flex items-center justify-center font-bold text-on-surface-variant">TRUST BLOCK</div>
              <div className="h-8 w-32 bg-outline-variant rounded flex items-center justify-center font-bold text-on-surface-variant">W-OWNED</div>
              <div className="h-8 w-32 bg-outline-variant rounded flex items-center justify-center font-bold text-on-surface-variant">VERIFY.AI</div>
              <div className="h-8 w-32 bg-outline-variant rounded flex items-center justify-center font-bold text-on-surface-variant">CHAIN LINK</div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 bg-surface-container-low text-left" id="features">
          <div className="max-w-container-max mx-auto px-lg">
            <div className="text-center mb-16">
              <h2 className="font-headline text-headline-lg text-on-surface mb-4">Enterprise-Grade Infrastructure</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Precision tools designed for industrial integrity and absolute transparency in every transaction.</p>
            </div>
            <div className="bento-grid">
              {/* Feature 1: Main */}
              <div className="col-span-12 md:col-span-8 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant hover:shadow-lg transition-all group">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <span className="material-symbols-outlined text-4xl text-primary mb-4 p-3 bg-primary-fixed rounded-lg">verified</span>
                    <h3 className="font-headline text-headline-md mb-4">Blockchain Verified</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6">Every step of your product journey is etched into a secure, immutable ledger. No alterations, no disputes, just absolute truth.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 font-label-md text-label-md text-secondary"><span class="material-symbols-outlined text-sm">check_circle</span> End-to-end encryption</li>
                      <li className="flex items-center gap-2 font-label-md text-label-md text-secondary"><span class="material-symbols-outlined text-sm">check_circle</span> Multi-node consensus</li>
                    </ul>
                  </div>
                  <div className="flex-1 w-full h-48 md:h-auto overflow-hidden rounded-lg">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt="Blockchain ledger concept" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3jJAZDlUIMpoHA1sM73igckuVlIFtuR3PeEGXGly9Cr632SMsaEAjFrABk0Q8MEdNyd6Nw-WEsX4qfarZj1cxYu7LNAS3CJWWuVmgeQhuf2EB-ARsL66Zqce8MDKU3MhLfbVMXsrIjJkGXamHv-meW0lbseB05wIX3LFzTuQacKzMFfLjuKfa-2KuhbK6pWQLYXoATCav0Ec2k2_Imn9ZLgXNjSCAMZ7yt-pXdtvNQqoFTVNh0VBEhSatfz_NBNdD0rynf4zdmes"
                    />
                  </div>
                </div>
              </div>
              {/* Feature 2: Small */}
              <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-4xl text-secondary mb-4 p-3 bg-secondary-container rounded-lg">my_location</span>
                <h3 className="font-headline text-headline-md mb-4">Real-time Tracking</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Monitor your shipments globally with sub-second latency updates and precise geolocation data.</p>
              </div>
              {/* Feature 3: Small */}
              <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-4xl text-tertiary mb-4 p-3 bg-tertiary-fixed rounded-lg">qr_code_2</span>
                <h3 className="font-headline text-headline-md mb-4">QR Generation</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Generate unique, secure QR codes for every SKU instantly, linking physical products to digital twins.</p>
              </div>
              {/* Feature 4: Medium */}
              <div className="col-span-12 md:col-span-8 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div className="max-w-md">
                    <span className="material-symbols-outlined text-4xl text-primary mb-4 p-3 bg-primary-fixed rounded-lg">bolt</span>
                    <h3 className="font-headline text-headline-md mb-4">Instant Verification</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Buyers can verify the authenticity and origin of their purchase in under 2 seconds using any smartphone.</p>
                  </div>
                  <div className="hidden lg:block bg-secondary/10 px-4 py-2 rounded-lg">
                    <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">Success Rate: 99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-surface-container-lowest text-left" id="how-it-works">
          <div className="max-w-container-max mx-auto px-lg">
            <div className="grid lg:grid-cols-2 gap-xl items-center">
              <div>
                <h2 className="font-headline text-headline-lg mb-6">From Production to Purchase</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-12">A streamlined workflow designed to onboard businesses quickly while maintaining the highest standards of data integrity.</p>
                <div className="space-y-12">
                  <div className="flex gap-md group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary text-primary flex items-center justify-center font-bold font-headline transition-all">1</div>
                    <div>
                      <h4 className="font-headline text-headline-md mb-2">Register Business</h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">Quickly onboard your enterprise and verify your certifications on our platform.</p>
                    </div>
                  </div>
                  <div className="flex gap-md group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary text-primary flex items-center justify-center font-bold font-headline transition-all">2</div>
                    <div>
                      <h4 className="font-headline text-headline-md mb-2">Register Product</h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">Add product details, batch numbers, and origin data to the secure ledger.</p>
                    </div>
                  </div>
                  <div className="flex gap-md group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary text-primary flex items-center justify-center font-bold font-headline transition-all">3</div>
                    <div>
                      <h4 className="font-headline text-headline-md mb-2">Generate QR</h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">Create unique identifiers for your items and apply them to physical packaging.</p>
                    </div>
                  </div>
                  <div className="flex gap-md group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary text-primary flex items-center justify-center font-bold font-headline transition-all">4</div>
                    <div>
                      <h4 className="font-headline text-headline-md mb-2">Verify Authenticity</h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">Customers scan the code to instantly view the full, verified product history.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-surface-container-low rounded-3xl overflow-hidden shadow-inner border border-outline-variant flex items-center justify-center p-8">
                  <img 
                    className="w-full h-full object-cover rounded-2xl shadow-lg" 
                    alt="Split workflow illustration" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUElpQdAOX1-BQRAHAkxUEeT51YBRz5nxh_g7lLHick4Utji7Xd9_gkNlnz7EhGOQ4EDlQKU6_jHqkSzOAs3qlp4uFE1dvdKzvpQp90wrTcBpijjnQ7ZxldjrZcbog0IFo8-d4V5nFqaaVJBbOoKKIdCQ_G0VgYtLMQy_CM8Md_o9N8iL3EEVnmYyXKZWvanGw6o-2_8pIhlzDRiuHjyZz-H6oI5iMizs5PHdNqVRBBgkh_ruxhkdyDpF_XAa4bCAG5ek2HZsAogc"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-secondary text-on-secondary p-6 rounded-2xl shadow-xl max-w-xs">
                  <p className="font-label-md text-label-md">"Onboarding took us less than 24 hours. The transparency it provides our customers is invaluable."</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-surface-container-low text-left" id="testimonials">
          <div className="max-w-container-max mx-auto px-lg">
            <div className="text-center mb-16">
              <h2 className="font-headline text-headline-lg">Success Stories</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-lg">
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm flex flex-col h-full">
                <div className="mb-6 text-primary flex">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface flex-grow mb-8 italic">"SupplyChain+ has transformed how we communicate our value to our boutique partners. They can see the impact of their purchase instantly."</p>
                <div className="flex items-center gap-md">
                  <img 
                    className="w-12 h-12 rounded-full object-cover" 
                    alt="Elena Rodriguez CEO" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCT1abtwyeSLj5nOLFaeyXuavKVGoEdpr4ojBIU7ovF2IS8EUFNq0VqexRfpkyLDeTlvel8I-af_BppXCf7Vtxskkf3Glb1uf0IQcWkJisP_RcMJXkw9sMZpP7EmG3Cm7R4XEzsB7qAy2T0w3gHV90t0-5Roac2xJKBkoEJwrcX98p-RYvWodejUfhtn-ae5oG_iVp8v8rL5jghByoInE8ctztegW0YJ-Th79BflR4rrizSHvcjYUUyKNcqVEs23k-1C2osxhcnEbU"
                  />
                  <div>
                    <p className="font-label-md text-label-md font-bold">Elena Rodriguez</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">CEO, Artisanal Threads</p>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm flex flex-col h-full">
                <div className="mb-6 text-primary flex">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface flex-grow mb-8 italic">"The real-time tracking has solved our logistical nightmare. We've reduced delivery disputes by 45% in the first quarter alone."</p>
                <div className="flex items-center gap-md">
                  <img 
                    className="w-12 h-12 rounded-full object-cover" 
                    alt="Marcus Chen Operations Director" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0ZvF7noNFL9DX4jv1ky7lRp5zgKsoPitc1js6x_KTpSi5m3AOBwTPTvG-KJMBqKIulqYIJiqjY4aFbOF8nEMadXOOrXQSoOrQfCXqTHKMFfEoKJmFt4ytIuzo1N1oEEvB6CEpACy00n2w61v7fGbRUdCpFNHvz5lFeGLSrhkmHi5cfqZWTXu9xVPVIJLStBWHDc7NxppftmhnNtaNcVtdCqv4LOJNrywWwmPId_yape_oajLQDN2KDMZ0t8ce9Tc4Whe4c6DIOSo"
                  />
                  <div>
                    <p className="font-label-md text-label-md font-bold">Marcus Chen</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Operations Director, SwiftLog</p>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm flex flex-col h-full">
                <div className="mb-6 text-primary flex">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface flex-grow mb-8 italic">"Implementing the blockchain verified badge has given us a significant competitive edge in the organic coffee market."</p>
                <div className="flex items-center gap-md">
                  <img 
                    className="w-12 h-12 rounded-full object-cover" 
                    alt="Sarah Jenkins Founder" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO_XrtX-_4JJM_rsxT9Q9SUdAhuWZPBCtwHWu8gjDHBmu-M3z8q8iTZ9CN82_85405Mu6oXWue9yBvQubndeWRf7ZAMTcChbKqyxJeFp-RclV9VAahKOVwfEoGR6w9usw7gE95TQvqzbr7h3fVVad7wmpc0HwYjaA67hqv7Nioke0CO_HQyJ8JIRLx6lVEVK5ZGG3vQVTSbAmtovmf9W-iBUaAJm_ur8UagsLtzpUy-17uewKkWlaGsdQ0tQYmH6nUC-XYckHlb88"
                  />
                  <div>
                    <p className="font-label-md text-label-md font-bold">Sarah Jenkins</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Founder, PureBean Collective</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-surface-container-lowest text-left" id="faq">
          <div className="max-w-3xl mx-auto px-lg">
            <div className="text-center mb-16">
              <h2 className="font-headline text-headline-lg">Common Questions</h2>
            </div>
            <div className="space-y-4">
              <details className="group bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden" open>
                <summary className="flex justify-between items-center p-6 cursor-pointer font-headline text-[18px] text-on-surface list-none font-semibold">
                  How secure is the blockchain verification?
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="px-6 pb-6 font-body-md text-body-md text-on-surface-variant">
                  Our platform utilizes a private, enterprise-grade blockchain that ensures data is encrypted at rest and in transit. Once a record is committed, it cannot be altered, providing a definitive audit trail for every product.
                </div>
              </details>
              <details className="group bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden">
                <summary className="flex justify-between items-center p-6 cursor-pointer font-headline text-[18px] text-on-surface list-none font-semibold">
                  What are the costs for small businesses?
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="px-6 pb-6 font-body-md text-body-md text-on-surface-variant">
                  We offer a tiered pricing structure that grows with your business. For small and women-owned businesses, we provide a "Seed" tier that includes basic verification and tracking at a highly subsidized rate.
                </div>
              </details>
              <details className="group bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden">
                <summary className="flex justify-between items-center p-6 cursor-pointer font-headline text-[18px] text-on-surface list-none font-semibold">
                  Do customers need an app to verify products?
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="px-6 pb-6 font-body-md text-body-md text-on-surface-variant">
                  No. Our verification system works directly in any mobile web browser. Customers simply scan the QR code with their phone's camera and are instantly redirected to the verified product ledger page.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-lg text-center">
          <div className="max-w-container-max mx-auto bg-primary rounded-[2rem] p-12 md:p-24 text-on-primary relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-headline text-headline-lg font-bold mb-8">Ready to secure your chain?</h2>
              <p className="font-body-lg text-body-lg mb-12 max-w-xl mx-auto opacity-90">Join thousands of businesses already using SupplyChain+ to build radical transparency and trust with their customers.</p>
              <div className="flex flex-wrap justify-center gap-md">
                <button 
                  className="bg-white text-primary px-lg py-md rounded-lg font-headline text-[16px] font-semibold hover:bg-surface-container-low transition-all"
                  onClick={handleGetStarted}
                >
                  Get Started for Free
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary opacity-20 blur-3xl -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-fixed-dim opacity-10 blur-3xl -ml-48 -mb-48"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-xl px-lg bg-surface-container-low border-t border-outline-variant text-left">
        <div className="max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-4 gap-gutter mb-12">
          <div className="col-span-2 md:col-span-1">
            <a className="text-headline-md font-headline font-bold text-on-surface mb-6 block" href="#">SupplyChain+</a>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">Industrial Integrity in every block. Secure logistics for the modern global marketplace.</p>
          </div>
          <div>
            <h5 className="font-label-md text-label-md font-bold mb-4">Platform</h5>
            <ul className="space-y-2">
              <li><a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">Features</a></li>
              <li><a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">How it Works</a></li>
              <li><a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">Verification</a></li>
              <li><a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-md text-label-md font-bold mb-4">Company</h5>
            <ul className="space-y-2">
              <li><a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">About Us</a></li>
              <li><a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">Blog</a></li>
              <li><a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">Partners</a></li>
              <li><a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-md text-label-md font-bold mb-4">Support</h5>
            <ul className="space-y-2">
              <li><a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">Help Center</a></li>
              <li><a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">API Docs</a></li>
              <li><a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-container-max mx-auto pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 SupplyChain+. All rights reserved. Industrial Integrity in every block.</p>
          <div className="flex gap-lg">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
