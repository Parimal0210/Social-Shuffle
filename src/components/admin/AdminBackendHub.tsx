import React, { useState } from 'react';
import {
  Database,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Code2,
  Terminal,
  ExternalLink,
  Layers,
  ArrowRight,
  FolderGit2,
  FileCode2,
  Zap,
  Play
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_API_URL } from '../../services/api';

export const AdminBackendHub: React.FC = () => {
  const {
    backendStatus,
    backendUrl,
    setBackendUrl,
    checkBackendConnection,
    syncWithBackend,
    events,
    games,
    participants,
    registrations,
    feedbackList,
    reportsList,
    volunteersList
  } = useApp();

  const [inputUrl, setInputUrl] = useState(backendUrl);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sts_project' | 'api_reference' | 'guide'>('overview');
  const [selectedFile, setSelectedFile] = useState<string>('application.properties');
  const [copiedFile, setCopiedFile] = useState(false);
  const [apiTestResponse, setApiTestResponse] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setSyncResult(null);
    setBackendUrl(inputUrl);
    await checkBackendConnection();
    setTesting(false);
  };

  const handleSyncToMongo = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await syncWithBackend();
    setSyncResult(res);
    setSyncing(false);
  };

  const filesContent: Record<string, { lang: string; title: string; desc: string; code: string }> = {
    'application.properties': {
      lang: 'properties',
      title: 'src/main/resources/application.properties',
      desc: 'MongoDB URI connection string and port configuration',
      code: `# Social Shuffle - Spring Boot & MongoDB Configuration
spring.application.name=social-shuffle-backend
server.port=8080

# Option 1: Local MongoDB Community Server
spring.data.mongodb.uri=mongodb://localhost:27017/social_shuffle

# Option 2: MongoDB Atlas Cloud
# spring.data.mongodb.uri=mongodb+srv://<user>:<password>@cluster0.mongodb.net/social_shuffle?retryWrites=true&w=majority

spring.data.mongodb.auto-index-creation=true
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173
logging.level.com.socialshuffle=DEBUG`
    },
    'pom.xml': {
      lang: 'xml',
      title: 'pom.xml',
      desc: 'Spring Boot 3.3.4 + Spring Data MongoDB Maven Dependencies',
      code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
    </parent>
    <groupId>com.socialshuffle</groupId>
    <artifactId>social-shuffle-backend</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
    </dependencies>
</project>`
    },
    'SocialShuffleApplication.java': {
      lang: 'java',
      title: 'com.socialshuffle.SocialShuffleApplication.java',
      desc: 'Main Spring Boot STS entry point',
      code: `package com.socialshuffle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.socialshuffle.repository")
public class SocialShuffleApplication {
    public static void main(String[] args) {
        SpringApplication.run(SocialShuffleApplication.class, args);
        System.out.println("🎲 Social Shuffle Pune Spring Boot API Started on 8080!");
    }
}`
    },
    'ShuffleEventRepository.java': {
      lang: 'java',
      title: 'com.socialshuffle.repository.ShuffleEventRepository.java',
      desc: 'Spring Data MongoDB Repository for Meetup Events',
      code: `package com.socialshuffle.repository;

import com.socialshuffle.model.ShuffleEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShuffleEventRepository extends MongoRepository<ShuffleEvent, String> {
    List<ShuffleEvent> findByStatusIgnoreCase(String status);
    List<ShuffleEvent> findAllByOrderByNumberDesc();
    List<ShuffleEvent> findAllByOrderByDateDesc();
}`
    },
    'RegistrationRepository.java': {
      lang: 'java',
      title: 'com.socialshuffle.repository.RegistrationRepository.java',
      desc: 'Spring Data MongoDB Repository for Attendee Registrations',
      code: `package com.socialshuffle.repository;

import com.socialshuffle.model.Registration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistrationRepository extends MongoRepository<Registration, String> {
    List<Registration> findByEventId(String eventId);
    List<Registration> findByParticipantId(String participantId);
    List<Registration> findByEventIdAndAttendanceStatus(String eventId, String status);
    long countByEventId(String eventId);
}`
    },
    'RegistrationController.java': {
      lang: 'java',
      title: 'com.socialshuffle.controller.RegistrationController.java',
      desc: 'REST API for RSVP, 1-Tap Attendance Check-in, Walk-ins, & Plays',
      code: `package com.socialshuffle.controller;

import com.socialshuffle.model.Registration;
import com.socialshuffle.repository.RegistrationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = "*")
public class RegistrationController {
    private final RegistrationRepository registrationRepository;
    
    public RegistrationController(RegistrationRepository repo) {
        this.registrationRepository = repo;
    }
    
    @GetMapping
    public List<Registration> getByEvent(@RequestParam(required = false) String eventId) {
        return eventId != null ? registrationRepository.findByEventId(eventId) : registrationRepository.findAll();
    }
    
    @PostMapping
    public Registration book(@RequestBody Registration reg) {
        return registrationRepository.save(reg);
    }
    
    @PatchMapping("/{id}/attendance")
    public ResponseEntity<Registration> checkIn(@PathVariable String id, @RequestParam String status) {
        return registrationRepository.findById(id).map(reg -> {
            reg.setAttendanceStatus(status);
            return ResponseEntity.ok(registrationRepository.save(reg));
        }).orElse(ResponseEntity.notFound().build());
    }
}`
    },
    'Participant.java': {
      lang: 'java',
      title: 'com.socialshuffle.model.Participant.java',
      desc: 'MongoDB Document Mapping for Pune Shuffler Profiles',
      code: `package com.socialshuffle.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "participants")
public class Participant {
    @Id
    private String id;
    private String name;
    
    @Indexed(unique = true)
    private String email;
    
    @Indexed
    private String phone;
    private String area;
    private int totalEventsAttended;
    private int totalRegistrations;
    private List<String> gamesPlayedIds = new ArrayList<>();
    private List<String> venuesVisited = new ArrayList<>();
    private int totalPaxBrought;
    // Getters and Setters...
}`
    }
  };

  const copyCodeToClipboard = () => {
    const code = filesContent[selectedFile]?.code || '';
    navigator.clipboard.writeText(code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const testEndpoint = async (path: string) => {
    try {
      setApiTestResponse('Fetching ' + path + '...');
      const res = await fetch(`${inputUrl}${path}`);
      const data = await res.json();
      setApiTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiTestResponse(`Error: ${err?.message || 'Could not connect to ' + inputUrl + path}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111C3B] via-[#162349] to-[#0A1128] border border-[#1F305E] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#35C8A8] to-[#1F305E] p-0.5 shadow-lg shadow-[#35C8A8]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0A1128] rounded-[14px] flex items-center justify-center">
                <Database className="w-6 h-6 text-[#35C8A8]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  Java Spring Boot & MongoDB Hub
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#35C8A8]/20 text-[#35C8A8] border border-[#35C8A8]/40">
                  STS Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Full dynamic database backend running with Spring Data MongoDB and REST APIs.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                backendStatus === 'connected'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{backendStatus === 'connected' ? 'Spring Boot + MongoDB Connected' : 'Local Dynamic Fallback Active'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1F305E] gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#111C3B] text-[#35C8A8] border-t-2 border-[#35C8A8]'
              : 'text-slate-400 hover:text-white hover:bg-[#111C3B]/50'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Connection & Database Stats</span>
        </button>
        <button
          onClick={() => setActiveTab('sts_project')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
            activeTab === 'sts_project'
              ? 'bg-[#111C3B] text-[#35C8A8] border-t-2 border-[#35C8A8]'
              : 'text-slate-400 hover:text-white hover:bg-[#111C3B]/50'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>STS Codebase & Models</span>
        </button>
        <button
          onClick={() => setActiveTab('api_reference')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
            activeTab === 'api_reference'
              ? 'bg-[#111C3B] text-[#35C8A8] border-t-2 border-[#35C8A8]'
              : 'text-slate-400 hover:text-white hover:bg-[#111C3B]/50'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>REST API Tester</span>
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
            activeTab === 'guide'
              ? 'bg-[#111C3B] text-[#35C8A8] border-t-2 border-[#35C8A8]'
              : 'text-slate-400 hover:text-white hover:bg-[#111C3B]/50'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>STS Setup Instructions</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CONNECTION */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Connection URL Bar */}
          <div className="p-5 rounded-2xl bg-[#111C3B] border border-[#1F305E] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FFC226]" />
              Spring Boot REST API Endpoint
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  placeholder="http://localhost:8080/api"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A1128] border border-[#1F305E] text-white text-xs font-mono focus:border-[#35C8A8] outline-none"
                />
              </div>

              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-5 py-2.5 rounded-xl bg-[#35C8A8] text-[#0A1128] font-black text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                onClick={handleSyncToMongo}
                disabled={syncing}
                className="px-5 py-2.5 rounded-xl bg-[#FF6036] text-white font-black text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 shadow-md shadow-[#FF6036]/20"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{syncing ? 'Syncing...' : 'Sync Data to MongoDB'}</span>
              </button>
            </div>

            {syncResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  syncResult.success
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {syncResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{syncResult.message}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              💡 When you launch <code className="text-[#35C8A8] font-mono">SocialShuffleApplication.java</code> in Spring Tool Suite, it boots on <code className="text-white font-mono">http://localhost:8080/api</code>. Any changes made in the UI will automatically persist to MongoDB collections.
            </p>
          </div>

          {/* Dynamic MongoDB Collections Overview */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#35C8A8]" />
              MongoDB Collections & Active Dynamic Records
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E]">
                <div className="text-[11px] text-slate-400 font-medium">events</div>
                <div className="text-2xl font-black text-white mt-1">{events.length}</div>
                <span className="text-[10px] text-[#35C8A8]">ShuffleEvent documents</span>
              </div>

              <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E]">
                <div className="text-[11px] text-slate-400 font-medium">games</div>
                <div className="text-2xl font-black text-white mt-1">{games.length}</div>
                <span className="text-[10px] text-[#FFC226]">Board game titles</span>
              </div>

              <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E]">
                <div className="text-[11px] text-slate-400 font-medium">participants</div>
                <div className="text-2xl font-black text-white mt-1">{participants.length}</div>
                <span className="text-[10px] text-[#FF6036]">Pune Shufflers CRM</span>
              </div>

              <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E]">
                <div className="text-[11px] text-slate-400 font-medium">registrations</div>
                <div className="text-2xl font-black text-white mt-1">{registrations.length}</div>
                <span className="text-[10px] text-[#8F43EE]">RSVPs & Attendances</span>
              </div>

              <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E]">
                <div className="text-[11px] text-slate-400 font-medium">feedback</div>
                <div className="text-2xl font-black text-white mt-1">{feedbackList.length}</div>
                <span className="text-[10px] text-slate-400">Ratings & suggestions</span>
              </div>

              <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E]">
                <div className="text-[11px] text-slate-400 font-medium">safety_reports</div>
                <div className="text-2xl font-black text-white mt-1">{reportsList.length}</div>
                <span className="text-[10px] text-slate-400">Confidential reports</span>
              </div>

              <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E]">
                <div className="text-[11px] text-slate-400 font-medium">volunteers</div>
                <div className="text-2xl font-black text-white mt-1">{volunteersList.length}</div>
                <span className="text-[10px] text-slate-400">Host applications</span>
              </div>

              <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E]">
                <div className="text-[11px] text-slate-400 font-medium">Backend Engine</div>
                <div className="text-sm font-black text-[#35C8A8] mt-2">Spring Boot 3.3</div>
                <span className="text-[10px] text-slate-400">STS Maven Project</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STS PROJECT CODE EXPLORER */}
      {activeTab === 'sts_project' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* File List */}
            <div className="space-y-1 bg-[#111C3B] border border-[#1F305E] p-3 rounded-2xl h-fit">
              <div className="text-[11px] font-black uppercase text-slate-400 px-3 py-1">
                Project Files (STS Explorer)
              </div>
              {Object.keys(filesContent).map(fileName => (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                    selectedFile === fileName
                      ? 'bg-[#35C8A8]/20 text-[#35C8A8] font-bold border border-[#35C8A8]/30'
                      : 'text-slate-300 hover:bg-[#162349]'
                  }`}
                >
                  <span className="truncate">{fileName}</span>
                  <Code2 className="w-3.5 h-3.5 shrink-0 opacity-60" />
                </button>
              ))}
            </div>

            {/* Code Viewer */}
            <div className="md:col-span-2 space-y-3">
              <div className="p-4 rounded-2xl bg-[#090F22] border border-[#1F305E] space-y-3">
                <div className="flex items-center justify-between border-b border-[#1F305E] pb-3">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white">
                      {filesContent[selectedFile]?.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {filesContent[selectedFile]?.desc}
                    </p>
                  </div>
                  <button
                    onClick={copyCodeToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#162349] hover:bg-[#1F305E] text-slate-200 text-xs font-semibold border border-[#1F305E] transition-colors"
                  >
                    {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="text-xs font-mono text-slate-200 overflow-x-auto p-3 rounded-xl bg-[#050914] max-h-96 leading-relaxed">
                  <code>{filesContent[selectedFile]?.code}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REST API TESTER */}
      {activeTab === 'api_reference' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#111C3B] border border-[#1F305E] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#35C8A8]" />
              Quick Endpoint Live Tester
            </h3>
            <p className="text-xs text-slate-300">
              Click any endpoint below to test live communication with the Spring Boot server running at{' '}
              <code className="text-[#35C8A8] font-mono">{inputUrl}</code>:
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => testEndpoint('/system/health')}
                className="px-3 py-1.5 rounded-xl bg-[#162349] hover:bg-[#1F305E] border border-[#1F305E] text-xs font-mono text-[#35C8A8] flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                GET /system/health
              </button>

              <button
                onClick={() => testEndpoint('/events')}
                className="px-3 py-1.5 rounded-xl bg-[#162349] hover:bg-[#1F305E] border border-[#1F305E] text-xs font-mono text-[#FF6036] flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                GET /events
              </button>

              <button
                onClick={() => testEndpoint('/games')}
                className="px-3 py-1.5 rounded-xl bg-[#162349] hover:bg-[#1F305E] border border-[#1F305E] text-xs font-mono text-[#FFC226] flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                GET /games
              </button>

              <button
                onClick={() => testEndpoint('/participants')}
                className="px-3 py-1.5 rounded-xl bg-[#162349] hover:bg-[#1F305E] border border-[#1F305E] text-xs font-mono text-[#8F43EE] flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                GET /participants
              </button>

              <button
                onClick={() => testEndpoint('/registrations')}
                className="px-3 py-1.5 rounded-xl bg-[#162349] hover:bg-[#1F305E] border border-[#1F305E] text-xs font-mono text-cyan-300 flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                GET /registrations
              </button>
            </div>

            {apiTestResponse && (
              <div className="mt-3">
                <div className="text-[11px] font-bold text-slate-400 mb-1">Server Response:</div>
                <pre className="text-xs font-mono text-slate-200 bg-[#050914] p-3 rounded-xl border border-[#1F305E] max-h-60 overflow-y-auto">
                  {apiTestResponse}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STS SETUP GUIDE */}
      {activeTab === 'guide' && (
        <div className="p-6 rounded-2xl bg-[#111C3B] border border-[#1F305E] space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#35C8A8]" />
            Importing & Running in Spring Tool Suite (STS)
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#35C8A8] text-[#0A1128] font-black text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Import Maven Project into STS</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Open STS ➔ <strong>File</strong> ➔ <strong>Import...</strong> ➔ <strong>Maven</strong> ➔ <strong>Existing Maven Projects</strong>. Select the <code className="text-[#35C8A8] font-mono">backend-spring-boot-mongodb</code> directory.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FF6036] text-white font-black text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Ensure MongoDB is Running</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Start your local MongoDB Community Server on port 27017 or paste your MongoDB Atlas URI in <code className="text-[#FF6036] font-mono">application.properties</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#8F43EE] text-white font-black text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Run the Spring Boot Application</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Right-click <code className="text-[#8F43EE] font-mono">SocialShuffleApplication.java</code> ➔ <strong>Run As</strong> ➔ <strong>Spring Boot App</strong>. The REST API will start immediately on <code className="text-white font-mono">http://localhost:8080/api</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FFC226] text-[#0A1128] font-black text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Connect & Enjoy Dynamic Real-Time Sync</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  In this dashboard, click <strong>Test Connection</strong>. The system indicator will switch to <strong>Spring Boot + MongoDB Connected</strong> and all registrations, games, attendance check-ins, and participant records will persist in MongoDB!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
