import { Card } from '@/components/ui/card';
import { useTopicAnalytics } from '@/hooks/useTopicAnalytics';
import { useQuestionStats } from '@/hooks/useQuestionStats';
import { useSections } from '@/hooks/useSections';
import { getSectionTitle } from '@/utils/sectionDisplay';
import { useMemo, type CSSProperties } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';

function stableHslForSectionId(sectionId: string): string {
  let h = 0;
  for (let i = 0; i < sectionId.length; i++) h = (h * 31 + sectionId.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 70%, 55%)`;
}

/** Room for outside labels + tooltips so they are not clipped at chart edges. */
const pieChartMargin = { top: 36, right: 32, bottom: 12, left: 32 };

const tooltipBoxStyle: CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.95)',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#ffffff',
  maxWidth: 'min(280px, calc(100vw - 2rem))',
  boxSizing: 'border-box',
  wordWrap: 'break-word',
};

/** Pie segment tooltip: "Label - N%" of chart total (hover / tap). */
function TopicSegmentTooltip({
  active,
  payload,
  total,
}: TooltipProps<number, string> & { total: number }) {
  if (!active || !payload?.length || total <= 0) return null;
  const row = payload[0];
  const name = String(row.name ?? '');
  const value = typeof row.value === 'number' ? row.value : Number(row.value);
  if (!Number.isFinite(value)) return null;
  const pct = Math.round((value / total) * 100);
  return (
    <div style={tooltipBoxStyle}>
      <p style={{ margin: 0, color: '#ffffff' }}>
        {name} - {pct}%
      </p>
    </div>
  );
}

export function QuestionBreakdownCharts() {
  const { topics } = useTopicAnalytics();
  const { sections } = useSections();
  const { getAllStats } = useQuestionStats();
  const stats = getAllStats();

  const labelForSection = useMemo(
    () => (sectionId: string) => getSectionTitle(sections, sectionId),
    [sections],
  );

  /** Total questions in the loaded curriculum (same basis as HomePage / nav). */
  const totalSystemQuestions = useMemo(
    () =>
      sections.reduce(
        (acc, section) =>
          acc +
          section.subsections.reduce((sub, subsec) => sub + subsec.questions.length, 0),
        0,
      ),
    [sections],
  );

  // Calculate overall answered vs unanswered
  const overallBreakdown = useMemo(() => {
    const answered = stats.total;
    const cap = Math.max(totalSystemQuestions, answered);
    const unanswered = Math.max(0, cap - answered);
    return [
      { name: 'Answered', value: answered, fill: '#10b981' },
      { name: 'Unanswered', value: unanswered, fill: '#64748b' },
    ];
  }, [stats.total, totalSystemQuestions]);

  // Calculate correct vs incorrect from answered
  const correctBreakdown = useMemo(() => {
    const correct = stats.correct || 0;
    const incorrect = (stats.total || 0) - correct;
    return [
      { name: 'Correct', value: correct, fill: '#3b82f6' },
      { name: 'Incorrect', value: incorrect, fill: '#ef4444' },
    ];
  }, [stats]);

  // Calculate by topic breakdown
  const topicAnswered = useMemo(() => {
    return topics.map((t) => ({
      name: labelForSection(t.sectionId),
      value: t.total,
      fill: stableHslForSectionId(t.sectionId),
    }));
  }, [topics, labelForSection]);

  const topicCorrect = useMemo(() => {
    return topics
      .map((t) => ({
        name: labelForSection(t.sectionId),
        value: t.correct,
        fill: stableHslForSectionId(t.sectionId),
      }))
      .filter((t) => t.value > 0);
  }, [topics, labelForSection]);

  const topicAnsweredTotal = useMemo(
    () => topicAnswered.reduce((s, t) => s + t.value, 0),
    [topicAnswered],
  );
  const topicCorrectTotal = useMemo(
    () => topicCorrect.reduce((s, t) => s + t.value, 0),
    [topicCorrect],
  );

  return (
    <div className="grid grid-cols-1 gap-6 overflow-visible lg:grid-cols-2">
      {/* Overall Answered vs Unanswered */}
      <Card variant="glass" className="flex flex-col overflow-visible p-6 glow-primary transition-glow">
        <h3 className="text-lg font-semibold mb-4 gradient-text">Questions Answered</h3>
        <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-visible">
          {totalSystemQuestions > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={300}
              className="[&_.recharts-surface]:overflow-visible [&_.recharts-wrapper]:overflow-visible"
            >
              <PieChart margin={pieChartMargin} style={{ overflow: 'visible' }}>
                <Pie
                  data={overallBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={92}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {overallBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  offset={12}
                  wrapperStyle={{ outline: 'none', zIndex: 50 }}
                  content={(props) => (
                    <TopicSegmentTooltip
                      {...props}
                      total={Math.max(totalSystemQuestions, stats.total)}
                    />
                  )}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center">Loading question bank…</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mt-4">
          <div className="text-center">
            <p className="text-muted-foreground">Answered</p>
            <p className="text-lg font-bold text-success">{stats.total}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Remaining</p>
            <p className="text-lg font-bold text-muted-foreground">
              {Math.max(0, totalSystemQuestions - stats.total)}
            </p>
          </div>
        </div>
      </Card>

      {/* Correct vs Incorrect */}
      <Card variant="glass" className="flex flex-col overflow-visible p-6 glow-accent transition-glow">
        <h3 className="text-lg font-semibold mb-4 gradient-text">Accuracy</h3>
        <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-visible">
          {stats.total > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={300}
              className="[&_.recharts-surface]:overflow-visible [&_.recharts-wrapper]:overflow-visible"
            >
              <PieChart margin={pieChartMargin} style={{ overflow: 'visible' }}>
                <Pie
                  data={correctBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={92}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {correctBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  offset={12}
                  wrapperStyle={{ outline: 'none', zIndex: 50 }}
                  content={(props) => (
                    <TopicSegmentTooltip {...props} total={stats.total} />
                  )}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center">No Data Yet</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mt-4">
          <div className="text-center">
            <p className="text-muted-foreground">Correct</p>
            <p className="text-lg font-bold text-success">{stats.correct || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Incorrect</p>
            <p className="text-lg font-bold text-destructive">{(stats.total || 0) - (stats.correct || 0)}</p>
          </div>
        </div>
      </Card>

      {/* By Topic - Questions Answered */}
      {topicAnswered.length > 0 && (
        <Card variant="glass" className="flex flex-col overflow-visible p-6 glow-primary transition-glow">
          <h3 className="text-lg font-semibold mb-4 gradient-text">Questions - Topic</h3>
          <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-visible">
            <ResponsiveContainer
              width="100%"
              height={300}
              className="[&_.recharts-surface]:overflow-visible [&_.recharts-wrapper]:overflow-visible"
            >
              <PieChart margin={pieChartMargin} style={{ overflow: 'visible' }}>
                <Pie
                  data={topicAnswered}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => value.toLocaleString()}
                  outerRadius={72}
                  dataKey="value"
                >
                  {topicAnswered.map((entry, index) => (
                    <Cell key={`topic-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  offset={12}
                  wrapperStyle={{ outline: 'none', zIndex: 50 }}
                  content={(props) => (
                    <TopicSegmentTooltip {...props} total={topicAnsweredTotal} />
                  )}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* By Topic - Correct Answers */}
      {topicCorrect.length > 0 && (
        <Card variant="glass" className="flex flex-col overflow-visible p-6 glow-accent transition-glow">
          <h3 className="text-lg font-semibold mb-4 gradient-text">Correct - Topic</h3>
          <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-visible">
            <ResponsiveContainer
              width="100%"
              height={300}
              className="[&_.recharts-surface]:overflow-visible [&_.recharts-wrapper]:overflow-visible"
            >
              <PieChart margin={pieChartMargin} style={{ overflow: 'visible' }}>
                <Pie
                  data={topicCorrect}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => value.toLocaleString()}
                  outerRadius={72}
                  dataKey="value"
                >
                  {topicCorrect.map((entry, index) => (
                    <Cell key={`correct-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  offset={12}
                  wrapperStyle={{ outline: 'none', zIndex: 50 }}
                  content={(props) => (
                    <TopicSegmentTooltip {...props} total={topicCorrectTotal} />
                  )}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
