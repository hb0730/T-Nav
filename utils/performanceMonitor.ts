// 性能监控工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private measurements: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 开始测量
  start(name: string): void {
    if (typeof performance !== 'undefined') {
      this.measurements.set(name, performance.now())
    }
  }

  // 结束测量并记录
  end(name: string): number {
    if (typeof performance === 'undefined')
      return 0

    const startTime = this.measurements.get(name)
    if (startTime === undefined)
      return 0

    const duration = performance.now() - startTime

    // 如果超过阈值则警告
    if (duration > 16) { // 超过一帧时间 (16ms)
      console.warn(`⚠️ Performance warning: ${name} took ${duration.toFixed(2)}ms`)
    }
    else if (duration > 8) {
      console.info(`ℹ️ Performance info: ${name} took ${duration.toFixed(2)}ms`)
    }

    this.measurements.delete(name)
    return duration
  }

  // 测量函数执行时间
  measure<T>(name: string, fn: () => T): T {
    this.start(name)
    const result = fn()
    this.end(name)
    return result
  }

  // 测量异步函数执行时间
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name)
    const result = await fn()
    this.end(name)
    return result
  }
}

// 导出单例实例
export const perfMonitor = PerformanceMonitor.getInstance()
