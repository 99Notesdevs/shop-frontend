'use client';
import ContactForm from '../components/common/contact-form';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
        <title>Contact Us - 99Notes</title>
        <meta name="description" content="Get in touch with 99Notes for any queries or support" />
      

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Reach out to us through any of the channels below.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FaMapMarkerAlt className="text-yellow-500 text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800">Our Location</h3>
                    <p className="text-gray-600 mt-1">
                      Near PNB, Civil Lines,<br />
                      Prayagraj, Uttar Pradesh 211002
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FaPhoneAlt className="text-yellow-500 text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800">Phone Number</h3>
                    <p className="text-gray-600 mt-1">
                      <a href="tel:+919368044455" className="hover:text-yellow-500 transition-colors">+91 93680 44455</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FaEnvelope className="text-yellow-500 text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800">Email Address</h3>
                    <p className="text-gray-600 mt-1">
                      <a href="mailto:contact@99notes.in" className="hover:text-yellow-500 transition-colors">contact@99notes.in</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FaClock className="text-yellow-500 text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800">Working Hours</h3>
                    <p className="text-gray-600 mt-1">
                      Monday - Saturday: 9:00 AM - 6:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-8">
                <h3 className="font-semibold text-gray-800 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="https://www.instagram.com/99notes_upsc/" target="_blank" rel="noopener noreferrer" className="bg-gray-100 p-3 rounded-full hover:bg-yellow-100 transition-colors">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a href="https://t.me/notes99" target="_blank" rel="noopener noreferrer" className="bg-gray-100 p-3 rounded-full hover:bg-yellow-100 transition-colors">
                    <span className="sr-only">Telegram</span>
                    <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1.01-.69.95-.6-.1-1.05-.33-1.63-.6-.9-.35-1.41-.57-2.28-.92-1.08-.43-.19-.66.12-1.05.12-.14 2.38-2.19 2.42-2.38.02-.03.03-.06.01-.1-.02-.02-.05-.03-.08-.02-.34.02-1.9 1.24-2.71 1.8-.24.16-.46.24-.66.24-.14 0-.34-.04-.5-.1-.49-.17-.87-.61-1.34-1.18-1.18-1.42-2.17-3.03-2.17-3.03 0-.07.01-.13.02-.18.02-.1.06-.15.12-.15.02 0 .05 0 .07.01.1.02.22.05.3.08.73.3 2.17.92 3.06 1.32.68.3 1.14.5 1.27.5.16 0 .45-.19.35-.5-.05-.16-.27-.53-.46-.9-.35-.62-.6-1.08-.6-1.45 0-.17.1-.31.29-.31.1 0 .2.02.29.06.62.29 1.09.54 1.56.88.7.5 1.2 1.07 1.54 1.32.14.1.23.1.32.1.08 0 .19-.02.25-.17.09-.22.29-.78.4-1.07.07-.2.14-.23.31-.23.08 0 .17.01.24.02.1.02.21.05.29.1.18.1.2.3.22.42.01.08.01.17.01.26 0 .08-.01.17-.01.25z" />
                    </svg>
                  </a>
                  <a href="https://www.youtube.com/c/99Notes" target="_blank" rel="noopener noreferrer" className="bg-gray-100 p-3 rounded-full hover:bg-yellow-100 transition-colors">
                    <span className="sr-only">YouTube</span>
                    <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Send us a Message</h2>
            <p className="text-gray-600 mb-8">
              Have questions or need assistance? Fill out the form below and we'll get back to you as soon as possible.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "What are your working hours?",
                answer: "Our customer support team is available from Monday to Saturday, 9:00 AM to 6:00 PM IST. We are closed on Sundays and public holidays."
              },
              {
                question: "How can I track my order?",
                answer: "Once your order is shipped, you will receive a tracking number via email. You can use this number to track your order on our website or the courier's website."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept various payment methods including credit/debit cards, net banking, UPI, and popular digital wallets for your convenience."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes, we offer refunds for products that are returned in their original condition within our specified return period. Please refer to our Returns & Refunds policy for more details."
              },
              {
                question: "How can I contact customer support?",
                answer: "You can reach our customer support team through the contact form on this page, via email at support@99notes.in, or by calling us at +91 93680 44455 during our working hours."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;