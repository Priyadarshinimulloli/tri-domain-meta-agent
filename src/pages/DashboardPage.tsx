import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Briefcase,
  Heart,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Wallet,
  Brain,
  FileText,
  Activity,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { useChatHistory, useMemories, useReports } from '@/hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { MetricCard } from '@/components/common/MetricCard'
import { DomainCard } from '@/components/common/DomainCard'
import { ChartCard } from '@/components/common/ChartCard'
import { ConversationCard } from '@/components/common/ConversationCard'
import { MemoryCard } from '@/components/common/MemoryCard'
import { ReportCard } from '@/components/common/ReportCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/utils/constants'
import { mockDomainScores, mockActivities, mockConversations, mockMemories, mockReports } from '@/utils/mockData'
import { activityIcons, domainIcons } from '@/utils/navigation'
import { formatRelativeDate } from '@/utils'

const chartData = [
  { month: 'Jan', career: 65, health: 72, finance: 58 },
  { month: 'Feb', career: 68, health: 75, finance: 62 },
  { month: 'Mar', career: 72, health: 78, finance: 65 },
  { month: 'Apr', career: 74, health: 80, finance: 68 },
  { month: 'May', career: 76, health: 82, finance: 70 },
  { month: 'Jun', career: 78, health: 85, finance: 72 },
]

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: conversations } = useChatHistory()
  const { data: memories } = useMemories()
  const { data: reports } = useReports()

  const recentConversations = conversations?.length ? conversations.slice(0, 3) : mockConversations
  const recentMemories = memories?.length ? memories.slice(0, 2) : mockMemories.slice(0, 2)
  const latestReports = reports?.length ? reports.slice(0, 1) : mockReports.slice(0, 1)

  const handleQuickSearch = () => {
    if (searchQuery.trim()) {
      navigate(ROUTES.CHAT, { state: { query: searchQuery } })
    }
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'there'}`}
        description="Your multi-domain AI advisory dashboard"
        badge="AI Powered"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-8"
      >
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">TriDomain Meta-Agent</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Ask anything across Career, Health & Finance</h2>
          <p className="text-muted-foreground mb-6">
            Get adaptive, explainable recommendations powered by RAG across all three life domains.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="What would you like to know?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
              className="bg-background/80 backdrop-blur-sm"
            />
            <Button variant="gradient" onClick={handleQuickSearch}>
              <MessageSquare className="h-4 w-4" />
              Ask AI
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Overall Score"
          value={mockDomainScores.overall}
          subtitle="Across all domains"
          icon={TrendingUp}
          trend={{ value: 5.2, label: 'this month' }}
          gradient="from-emerald-500 to-teal-500"
        />
        <MetricCard
          title="Conversations"
          value={recentConversations.length}
          subtitle="Recent sessions"
          icon={MessageSquare}
          gradient="from-blue-500 to-indigo-500"
        />
        <MetricCard
          title="Memories"
          value={memories?.length || mockMemories.length}
          subtitle="Saved insights"
          icon={Brain}
          gradient="from-purple-500 to-pink-500"
        />
        <MetricCard
          title="Reports"
          value={reports?.length || mockReports.length}
          subtitle="Generated"
          icon={FileText}
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Domain Overview</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.CHAT)}>
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <DomainCard
            domain="career"
            title="Career"
            description="Skills, roadmaps, and job recommendations"
            score={mockDomainScores.career}
            icon={Briefcase}
            href={ROUTES.CAREER}
            insight="Strong Python skills, focus on ML deployment next"
          />
          <DomainCard
            domain="health"
            title="Health"
            description="Fitness, nutrition, and wellness tracking"
            score={mockDomainScores.health}
            icon={Heart}
            href={ROUTES.HEALTH}
            insight="Sleep quality improving, maintain workout consistency"
          />
          <DomainCard
            domain="finance"
            title="Finance"
            description="Budget, savings, and investment guidance"
            score={mockDomainScores.finance}
            icon={Wallet}
            href={ROUTES.FINANCE}
            insight="38% savings rate — consider increasing equity allocation"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Domain Progress" description="Score trends over 6 months">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="careerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="financeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area type="monotone" dataKey="career" stroke="#3b82f6" fill="url(#careerGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="health" stroke="#10b981" fill="url(#healthGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="finance" stroke="#f59e0b" fill="url(#financeGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {mockActivities.map((activity) => {
                const Icon = activityIcons[activity.type as keyof typeof activityIcons] || activityIcons.default
                const DomainIcon = domainIcons[activity.domain as keyof typeof domainIcons]
                return (
                  <div key={activity.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <div className="flex items-center gap-2">
                        {DomainIcon && <DomainIcon className="h-3 w-3 text-muted-foreground" />}
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] capitalize shrink-0">
                      {activity.type}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          <h3 className="font-semibold">Recent Conversations</h3>
          {recentConversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              onClick={() => navigate(ROUTES.CHAT, { state: { conversationId: conv.id } })}
            />
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Latest Memories</h3>
          {recentMemories.map((mem) => (
            <MemoryCard key={mem.id} memory={mem} />
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Latest Report</h3>
          {latestReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </div>
    </div>
  )
}
