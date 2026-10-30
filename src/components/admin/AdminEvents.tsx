import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Dices,
  Plus,
  Edit,
  Copy,
  Archive,
  Search,
  Filter,
  CheckSquare,
  ArrowRight,
  TrendingUp,
  X,
  Bell,
  MessageSquare,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShuffleEvent, EventCategory, EventStatus } from '../../types';
import { AdminEventNotificationModal } from './AdminEventNotificationModal';
import { AdminWhatsAppBroadcastModal } from './AdminWhatsAppBroadcastModal';
import { AdminImportRegistrationsModal } from './AdminImportRegistrationsModal';

interface AdminEventsProps {
  onOpenAttendanceForEvent: (eventId: string) => void;
  onOpenImportForEvent?: (eventId: string) => void;
  showCreateModalInitially?: boolean;
  onCloseCreateModalInitially?: () => void;
}

export const AdminEvents: React.FC<AdminEventsProps> = ({
  onOpenAttendanceForEvent,
  onOpenImportForEvent,
  showCreateModalInitially = false,
  onCloseCreateModalInitially
}) => {
  const { events, createEvent, updateEvent, duplicateEvent, archiveEvent, registrations, games, sendEventBroadcast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<ShuffleEvent | null>(null);
  const [broadcastEvent, setBroadcastEvent] = useState<ShuffleEvent | null>(null);
  const [whatsAppEvent, setWhatsAppEvent] = useState<ShuffleEvent | null>(null);
  const [importEvent, setImportEvent] = useState<ShuffleEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(showCreateModalInitially);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [number, setNumber] = useState(events.length + 1);
  const [date, setDate] = useState('2025-05-18');
  const [time, setTime] = useState('Sunday, 4:00 PM - 7:00 PM');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Koregaon Park');
  const [category, setCategory] = useState<EventCategory>('Regular Meetup');
  const [capacity, setCapacity] = useState(60);
  const [ticketPrice, setTicketPrice] = useState(250);
  const [description, setDescription] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const filteredEvents = events.filter(e => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedEvent(null);
    setTitle(`Social Shuffle #${events.length + 1}`);
    setNumber(events.length + 1);
    setTime('Sunday, 4:00 PM - 7:00 PM');
    setVenue('');
    setAddress('');
    setArea('Koregaon Park');
    setCategory('Regular Meetup');
    setCapacity(60);
    setTicketPrice(250);
    setDescription('Pune’s biggest and coolest Sunday board game meetup. Meet people, learn games, roll dice!');
    setSelectedGames(['game-1', 'game-2', 'game-3']);
    setNotes('Arrive 15 mins early for table seating.');
    setIsModalOpen(true);
  };

  const openEditModal = (event: ShuffleEvent) => {
    setIsEditing(true);
    setSelectedEvent(event);
    setTitle(event.title);
    setNumber(event.number);
    setDate(event.date);
    setTime(event.time);
    setVenue(event.venue);
    setAddress(event.address);
    setArea(event.area);
    setCategory(event.category);
    setCapacity(event.capacity);
    setTicketPrice(event.ticketPrice);
    setDescription(event.description);
    setSelectedGames(event.plannedGames);
    setNotes(event.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedEvent) {
      updateEvent(selectedEvent.id, {
        title,
        number,
        date,
        time,
        venue,
        address,
        area,
        category,
        capacity,
        ticketPrice,
        description,
        plannedGames: selectedGames,
        notes
      });
    } else {
      createEvent({
        title,
        number,
        date,
        time,
        venue,
        address,
        area,
        category,
        capacity,
        ticketPrice,
        description,
        plannedGames: selectedGames,
        status: 'upcoming',
        notes
      });
    }
    setIsModalOpen(false);
    if (onCloseCreateModalInitially) onCloseCreateModalInitially();
  };

  const toggleGameSelection = (gameId: string) => {
    if (selectedGames.includes(gameId)) {
      setSelectedGames(selectedGames.filter(id => id !== gameId));
    } else {
      setSelectedGames([...selectedGames, gameId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-white tracking-tight">Events & Meetups Manager</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Manage upcoming, active, and past Social Shuffle sessions across Pune
          </p>
        </div>

        <button
          id="btn-create-event-top"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-heading font-bold text-xs shadow-sm shadow-[#FF751F]/25 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by event title, venue, or Pune area..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#10173E] border border-[#283677] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF751F]"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'upcoming', 'completed', 'archived'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#FF751F] text-white shadow-sm'
                  : 'bg-[#151E4D] border border-[#283677] text-[#94A3B8] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events List Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEvents.map(event => {
          const eventRegs = registrations.filter(r => r.eventId === event.id);
          const confirmedCount = eventRegs.filter(r => r.attendanceStatus !== 'Cancelled').length;
          const checkedInCount = eventRegs.filter(r => r.attendanceStatus === 'Checked In').length;
          const pendingCount = eventRegs.filter(r => r.attendanceStatus === 'Pending').length;
          const cancelledCount = eventRegs.filter(r => r.attendanceStatus === 'Cancelled').length;
          const totalPax = eventRegs
            .filter(r => r.attendanceStatus !== 'Cancelled')
            .reduce((acc, curr) => acc + curr.paxCount, 0);
          const capacityPercent = Math.min(100, Math.round((totalPax / (event.capacity || 1)) * 100));

          return (
            <div
              key={event.id}
              className="p-5 rounded-2xl bg-[#151E4D] border border-[#283677] hover:border-[#FF751F]/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-sm"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FF751F]/15 text-[#FF751F] border border-[#FF751F]/30">
                    Event #{event.number}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      event.status === 'upcoming'
                        ? 'bg-[#4AB4A4]/15 text-[#4AB4A4] border border-[#4AB4A4]/30'
                        : event.status === 'completed'
                        ? 'bg-[#FFD230]/15 text-[#FFD230] border border-[#FFD230]/30'
                        : 'bg-[#1A255C] text-[#94A3B8]'
                    }`}
                  >
                    {event.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-[#1A255C] text-[#CBD5E1] border border-[#283677]">
                    {event.category}
                  </span>
                  <span className="text-xs font-bold text-[#FFD230]">
                    ₹{event.ticketPrice} / ticket
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-heading font-bold text-white tracking-tight">
                    {event.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">{event.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#CBD5E1]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#FF751F]" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#4AB4A4]" />
                    {event.venue} ({event.area})
                  </span>
                </div>

                {/* Event Overview Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-[#10173E] border border-[#283677]">
                    <span className="text-[10px] text-[#94A3B8] block">Total Pax</span>
                    <span className="text-sm font-heading font-bold text-white">{totalPax}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#10173E] border border-[#283677]">
                    <span className="text-[10px] text-[#4AB4A4] block">Checked In</span>
                    <span className="text-sm font-heading font-bold text-[#4AB4A4]">{checkedInCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#10173E] border border-[#283677]">
                    <span className="text-[10px] text-[#FFD230] block">Pending</span>
                    <span className="text-sm font-heading font-bold text-[#FFD230]">{pendingCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#10173E] border border-[#283677]">
                    <span className="text-[10px] text-rose-400 block">Cancelled</span>
                    <span className="text-sm font-heading font-bold text-rose-400">{cancelledCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#10173E] border border-[#283677] col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[#94A3B8] block">Capacity</span>
                    <span className="text-sm font-heading font-bold text-white">
                      {capacityPercent}% ({totalPax}/{event.capacity})
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Actions & Attendance Jump */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#202B61]">
                <button
                  id={`btn-import-regs-${event.id}`}
                  onClick={() => setImportEvent(event)}
                  className="px-3.5 py-2 rounded-xl bg-[#1A255C] hover:bg-[#202B61] border border-[#4AB4A4]/50 text-[#4AB4A4] hover:text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  title="Import registrations from Excel/CSV and automatically email QR entry passes"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#4AB4A4]" />
                  <span>Import Registrations</span>
                </button>

                <button
                  id={`btn-wa-post-${event.id}`}
                  onClick={() => setWhatsAppEvent(event)}
                  className="px-3.5 py-2 rounded-xl bg-[#1A255C] hover:bg-[#202B61] border border-[#25D366]/50 text-[#25D366] hover:text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  title="Post modifiable announcements to WhatsApp community"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp Community Post</span>
                </button>

                <button
                  id={`btn-push-notif-${event.id}`}
                  onClick={() => setBroadcastEvent(event)}
                  className="px-3.5 py-2 rounded-xl bg-[#1A255C] hover:bg-[#202B61] border border-[#FF751F]/60 text-[#FF751F] hover:text-white font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm group"
                  title="Push notification to all attendees on Email as well as WhatsApp (if WhatsApp is unavailable, email is sent anyway)"
                >
                  <div className="flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-[#FF751F] group-hover:scale-110 transition-transform" />
                    <MessageSquare className="w-3 h-3 text-[#25D366]" />
                  </div>
                  <span>Push Notification</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF751F]/20 text-[#FF751F] font-mono">
                    {confirmedCount}
                  </span>
                </button>

                <button
                  id={`btn-open-att-${event.id}`}
                  onClick={() => onOpenAttendanceForEvent(event.id)}
                  className="px-4 py-2.5 rounded-xl bg-[#4AB4A4] hover:bg-[#2cb295] text-[#10173E] font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <CheckSquare className="w-4 h-4 text-[#10173E]" />
                  <span>Live Attendance Check-In</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#10173E]" />
                </button>

                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    onClick={() => openEditModal(event)}
                    title="Edit Event"
                    className="p-2 rounded-lg bg-[#1A255C] hover:bg-[#202B61] text-[#94A3B8] hover:text-white border border-[#283677] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateEvent(event.id)}
                    title="Duplicate Event"
                    className="p-2 rounded-lg bg-[#1A255C] hover:bg-[#202B61] text-[#94A3B8] hover:text-white border border-[#283677] transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {event.status !== 'archived' && (
                    <button
                      onClick={() => archiveEvent(event.id)}
                      title="Archive Event"
                      className="p-2 rounded-lg bg-[#1A255C] hover:bg-[#202B61] text-[#64748B] hover:text-rose-400 border border-[#283677] transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151E4D] border border-[#283677] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#202B61]">
              <h3 className="text-lg font-heading font-bold text-white">
                {isEditing ? 'Edit Social Shuffle Event' : 'Create New Social Shuffle Meetup'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseCreateModalInitially) onCloseCreateModalInitially();
                }}
                className="text-[#64748B] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#94A3B8] font-medium mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Social Shuffle #35"
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-medium mb-1">Event #</label>
                  <input
                    type="number"
                    required
                    value={number}
                    onChange={e => setNumber(Number(e.target.value))}
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-medium mb-1">Date & Time</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="Sunday, 4:00 PM - 7:00 PM"
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as EventCategory)}
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF751F]"
                  >
                    <option value="Regular Meetup">Regular Meetup</option>
                    <option value="Tournament">Tournament</option>
                    <option value="Theme Night">Theme Night</option>
                    <option value="Secret Event">Secret Event</option>
                    <option value="Collaborative Event">Collaborative Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-medium mb-1">Venue Name</label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    placeholder="FC Road Social, Teaology, etc."
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-medium mb-1">Pune Area</label>
                  <select
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF751F]"
                  >
                    <option value="Koregaon Park">Koregaon Park</option>
                    <option value="Baner">Baner</option>
                    <option value="Viman Nagar">Viman Nagar</option>
                    <option value="Kothrud">Kothrud</option>
                    <option value="FC Road / Shivajinagar">FC Road / Shivajinagar</option>
                    <option value="Aundh">Aundh</option>
                    <option value="Kalyani Nagar">Kalyani Nagar</option>
                    <option value="Wakad">Wakad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-medium mb-1">Detailed Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Lane 5, Koregaon Park, Pune"
                  className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF751F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-medium mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-medium mb-1">Ticket Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={ticketPrice}
                    onChange={e => setTicketPrice(Number(e.target.value))}
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#10173E] border border-[#283677] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF751F]"
                />
              </div>

              {/* Planned Games */}
              <div>
                <label className="block text-[#94A3B8] font-medium mb-1.5">
                  Select Featured Games from Library ({selectedGames.length} selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-[#10173E] border border-[#283677]">
                  {games.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGameSelection(g.id)}
                      className={`p-1.5 rounded-lg text-left text-[11px] truncate transition-colors ${
                        selectedGames.includes(g.id)
                          ? 'bg-[#FF751F] text-white font-bold'
                          : 'bg-[#1A255C] text-[#CBD5E1] hover:bg-[#202B61]'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#202B61]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#283677] text-[#94A3B8] font-semibold hover:bg-[#1A255C] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-heading font-bold shadow-sm shadow-[#FF751F]/25"
                >
                  {isEditing ? 'Update Event' : 'Publish Meetup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Push Email Notification Modal */}
      {broadcastEvent && (
        <AdminEventNotificationModal
          event={broadcastEvent}
          registrations={registrations}
          isOpen={!!broadcastEvent}
          onClose={() => setBroadcastEvent(null)}
          onBroadcast={sendEventBroadcast}
        />
      )}

      {/* WhatsApp Community Broadcast Modal */}
      {whatsAppEvent && (
        <AdminWhatsAppBroadcastModal
          event={whatsAppEvent}
          registrations={registrations}
          isOpen={!!whatsAppEvent}
          onClose={() => setWhatsAppEvent(null)}
        />
      )}

      {/* Import Registrations Modal */}
      {importEvent && (
        <AdminImportRegistrationsModal
          event={importEvent}
          isOpen={!!importEvent}
          onClose={() => setImportEvent(null)}
        />
      )}
    </div>
  );
};
