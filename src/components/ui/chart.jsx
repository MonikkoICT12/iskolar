import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cn } from '@/lib/utils'

const ChartContext = React.createContext(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }
  return context
}

const ChartContainer = React.forwardRef(
  ({ id, className, children, config = {}, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

    const colorVars = React.useMemo(() => {
      const vars = {}
      Object.entries(config).forEach(([key, item]) => {
        if (item?.color) {
          vars[`--color-${key}`] = item.color
        }
      })
      return vars
    }, [config])

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={chartId}
          ref={ref}
          style={colorVars}
          className={cn(
            'flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/70 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-brand/10 [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none',
            className
          )}
          {...props}
        >
          <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    )
  }
)
ChartContainer.displayName = 'Chart'

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef(
  (
    {
      active,
      payload,
      className,
      hideLabel = false,
      label,
      valueSuffix = '',
      formatter,
    },
    ref
  ) => {
    const { config } = useChart()

    if (!active || !payload?.length) {
      return null
    }

    const headerLabel = label ?? payload[0]?.payload?.[Object.keys(payload[0]?.payload || {})[0]]

    return (
      <div
        ref={ref}
        className={cn(
          'min-w-[8.5rem] rounded-xl border border-border/90 bg-white/95 backdrop-blur-xl px-3 py-2 text-xs shadow-[0_12px_32px_rgba(26,26,20,0.16)]',
          className
        )}
      >
        {!hideLabel && headerLabel && (
          <div className="mb-1.5 font-bold text-foreground border-b border-border/60 pb-1">
            {headerLabel}
          </div>
        )}
        <div className="space-y-1">
          {payload.map((item, idx) => {
            const key = item.dataKey || item.name || 'value'
            const itemConfig = config[key] || config[item.name] || {}
            const dotColor =
              item.payload?.fill || item.color || itemConfig.color || '#587529'
            const displayName = itemConfig.label || item.name || key
            const formattedVal = formatter
              ? formatter(item.value, item)
              : `${Number(item.value || 0).toLocaleString()}${valueSuffix}`

            return (
              <div
                key={`${key}-${idx}`}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span className="font-medium text-foreground/85">
                    {displayName}
                  </span>
                </div>
                <span className="font-bold tabular-nums text-foreground">
                  {formattedVal}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = 'ChartTooltip'

export { ChartContainer, ChartTooltip, ChartTooltipContent }
