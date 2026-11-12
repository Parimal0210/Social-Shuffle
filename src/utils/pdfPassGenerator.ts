import { jsPDF } from 'jspdf';
import { Registration, ShuffleEvent } from '../types';

/**
 * Loads an image from URL and returns a Base64 data URL or HTMLImageElement for jsPDF embedding
 */
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 250;
        canvas.height = img.naturalHeight || 250;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(url);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        resolve(url);
      }
    };
    img.onerror = () => {
      // Fallback: resolve with URL directly
      resolve(url);
    };
    img.src = url;
  });
};

/**
 * Generates and downloads a high-fidelity PDF entry pass with QR code and full registration details.
 */
export const downloadRegistrationPdf = async (
  registration: Registration,
  event?: ShuffleEvent
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5' // 148 x 210 mm
  });

  const pageWidth = 148;
  const pageHeight = 210;

  // Background deep midnight fill
  doc.setFillColor(16, 23, 62); // #10173E
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative Top Accent Bar in Coral
  doc.setFillColor(255, 117, 31); // #FF751F
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Header Box
  doc.setFillColor(21, 30, 77); // #151E4D
  doc.roundedRect(10, 12, 128, 26, 4, 4, 'F');
  doc.setDrawColor(40, 54, 119); // #283677
  doc.roundedRect(10, 12, 128, 26, 4, 4, 'D');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 210, 48); // #FFD230
  doc.text('SOCIAL SHUFFLE PUNE', 74, 22, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(74, 180, 164); // #4AB4A4
  doc.text('OFFICIAL VIP ATTENDEE & ENTRY PASS', 74, 28, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text("Turning Strangers into Teammates • Pune's Biggest Board Game Meetup", 74, 34, { align: 'center' });

  // Event Card Container
  doc.setFillColor(26, 37, 92); // #1A255C
  doc.roundedRect(10, 42, 128, 32, 3, 3, 'F');
  doc.setDrawColor(40, 54, 119);
  doc.roundedRect(10, 42, 128, 32, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  const eventTitle = event?.title || 'Social Shuffle Pune Meetup';
  const splitTitle = doc.splitTextToSize(eventTitle, 120);
  doc.text(splitTitle, 15, 49);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // #CBD5E1
  const dateTimeStr = `Date & Time: ${event?.date || 'Sunday'} | ${event?.time || '4:00 PM – 7:30 PM'}`;
  doc.text(dateTimeStr, 15, 59);

  const venueStr = `Venue: ${event?.venue || 'The Daily All Day'}, ${event?.area || 'Pune'}`;
  doc.text(venueStr, 15, 65);

  const addressStr = event?.address ? `Address: ${event.address}` : `Address: ${event?.area || 'Pune'}`;
  const splitAddress = doc.splitTextToSize(addressStr, 118);
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(splitAddress, 15, 71);

  // QR Code Center Card
  const qrBoxY = 78;
  doc.setFillColor(21, 30, 77); // #151E4D
  doc.roundedRect(10, qrBoxY, 128, 62, 3, 3, 'F');
  doc.setDrawColor(255, 117, 31); // Coral border for QR box
  doc.roundedRect(10, qrBoxY, 128, 62, 3, 3, 'D');

  // Load and place QR code
  const qrToken = registration.qrCodeToken || `SS-REG-${registration.id}`;
  const qrUrl =
    registration.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(qrToken)}`;

  try {
    const qrDataUri = await loadImageAsBase64(qrUrl);
    // Draw white background backing for QR code
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(54, qrBoxY + 5, 40, 40, 2, 2, 'F');
    doc.addImage(qrDataUri, 'PNG', 56, qrBoxY + 7, 36, 36);
  } catch (err) {
    console.warn('[PDF] QR image embedding failed:', err);
  }

  // Token text below QR
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 210, 48); // Yellow
  doc.text(qrToken, 74, qrBoxY + 51, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Present this digital QR pass at the entrance desk for instant check-in', 74, qrBoxY + 57, { align: 'center' });

  // Registration & Attendee Details Card
  const detailsY = 144;
  doc.setFillColor(26, 37, 92); // #1A255C
  doc.roundedRect(10, detailsY, 128, 44, 3, 3, 'F');
  doc.setDrawColor(40, 54, 119);
  doc.roundedRect(10, detailsY, 128, 44, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(74, 180, 164); // Teal
  doc.text('REGISTRATION & ATTENDEE SUMMARY', 15, detailsY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);

  // Left Column
  doc.text('Primary Attendee:', 15, detailsY + 14);
  doc.setTextColor(255, 255, 255);
  doc.text(registration.participantName, 45, detailsY + 14);

  doc.setTextColor(148, 163, 184);
  doc.text('Email Address:', 15, detailsY + 20);
  doc.setTextColor(255, 255, 255);
  doc.text(registration.participantEmail, 45, detailsY + 20);

  doc.setTextColor(148, 163, 184);
  doc.text('Phone Number:', 15, detailsY + 26);
  doc.setTextColor(255, 255, 255);
  doc.text(registration.participantPhone || '+91 98220 12345', 45, detailsY + 26);

  doc.setTextColor(148, 163, 184);
  doc.text('Seats Reserved:', 15, detailsY + 32);
  doc.setTextColor(255, 210, 48); // Yellow
  doc.setFont('helvetica', 'bold');
  const guestsSummary =
    registration.guests && registration.guests.length > 0
      ? ` (${registration.guests.map(g => g.name).join(', ')})`
      : '';
  doc.text(`${registration.paxCount} Shuffler(s)${guestsSummary}`, 45, detailsY + 32);

  // Right column / Payment Summary
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Payment Status:', 15, detailsY + 38);
  doc.setTextColor(74, 180, 164);
  doc.setFont('helvetica', 'bold');
  const amountStr = `Paid ₹${registration.amountPaid || (registration.paxCount * (event?.ticketPrice || 350))} via Razorpay`;
  doc.text(amountStr, 45, detailsY + 38);

  // Footer notes & helpline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Need help? Contact: socialshuffle.pune@gmail.com | Pune WhatsApp Community Desk', 74, 196, { align: 'center' });

  // Save the PDF directly to downloads
  const fileName = `Social_Shuffle_Pass_${registration.id || 'ticket'}.pdf`;
  doc.save(fileName);
};
