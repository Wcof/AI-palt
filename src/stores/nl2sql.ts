import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { DomainTerm, JdbcDataSource, NL2SQLCase } from '@/types/aiPlatform'

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, '')
}

export const useNL2SQLStore = defineStore('nl2sql', () => {
  const nl2sqlCases = ref<NL2SQLCase[]>([
    { id: 'case-1', question: '本月高风险隐患有多少？', type: 'Good Case', answer: "SELECT COUNT(*) AS total FROM hidden_risk_record WHERE risk_level = 'high' AND create_month = DATE_FORMAT(CURRENT_DATE, '%Y-%m');", remark: '演示样例，可直接填写 SQL。', updatedAt: nowText() },
  ])

  const terms = ref<DomainTerm[]>([
    { id: 'term-1', term: '高风险隐患', aliases: '重大隐患,红色风险,高危隐患', explanation: '风险等级为 high 或重大隐患标签为 true 的隐患记录。', domain: '安全生产', updatedAt: nowText() },
    { id: 'term-2', term: '闭环率', aliases: '整改闭环率,完成率', explanation: '已完成整改并通过复核的隐患数 / 应整改隐患总数。', domain: '安全生产', updatedAt: nowText() },
  ])

  const jdbc = ref<JdbcDataSource>({
    id: 'default-source',
    name: '安全生产演示数据源',
    dbType: 'MySQL',
    driverClass: 'com.mysql.cj.jdbc.Driver',
    host: '127.0.0.1',
    port: '3306',
    dbName: 'safety_prod',
    schema: '',
    username: 'demo_user',
    password: '',
    charset: 'utf8mb4',
    timezone: 'Asia/Shanghai',
    sslMode: '关闭',
    connectionTimeout: '30',
    maxPoolSize: '10',
    remark: '用于 NL2SQL 演示的单 JDBC 数据源',
    status: '未测试',
    updatedAt: nowText(),
  })

  const enabledGoodCases = computed(() => nl2sqlCases.value.filter(item => item.type === 'Good Case'))
  const badCases = computed(() => nl2sqlCases.value.filter(item => item.type === 'Bad Case'))

  function normalizeJdbcDefaults() {
    if (!jdbc.value.name) jdbc.value.name = '安全生产演示数据源'
    if (!jdbc.value.driverClass) jdbc.value.driverClass = driverFor(jdbc.value.dbType)
    if (!jdbc.value.charset) jdbc.value.charset = 'utf8mb4'
    if (!jdbc.value.timezone) jdbc.value.timezone = 'Asia/Shanghai'
    if (!jdbc.value.sslMode) jdbc.value.sslMode = '关闭'
    if (!jdbc.value.connectionTimeout) jdbc.value.connectionTimeout = '30'
    if (!jdbc.value.maxPoolSize) jdbc.value.maxPoolSize = '10'
  }

  function driverFor(dbType: JdbcDataSource['dbType']) {
    const map: Record<JdbcDataSource['dbType'], string> = {
      MySQL: 'com.mysql.cj.jdbc.Driver',
      PostgreSQL: 'org.postgresql.Driver',
      'SQL Server': 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
      Oracle: 'oracle.jdbc.OracleDriver',
      达梦: 'dm.jdbc.driver.DmDriver',
      人大金仓: 'com.kingbase8.Driver',
      其他: '',
    }
    return map[dbType] || ''
  }

  function applyDbTypePreset() {
    jdbc.value.driverClass = driverFor(jdbc.value.dbType)
    const defaultPorts: Record<JdbcDataSource['dbType'], string> = {
      MySQL: '3306',
      PostgreSQL: '5432',
      'SQL Server': '1433',
      Oracle: '1521',
      达梦: '5236',
      人大金仓: '54321',
      其他: '',
    }
    jdbc.value.port = defaultPorts[jdbc.value.dbType] || jdbc.value.port
  }

  function jdbcUrl() {
    normalizeJdbcDefaults()
    const host = jdbc.value.host || '{host}'
    const port = jdbc.value.port || '{port}'
    const dbName = jdbc.value.dbName || '{database}'
    if (jdbc.value.dbType === 'PostgreSQL') return `jdbc:postgresql://${host}:${port}/${dbName}`
    if (jdbc.value.dbType === 'SQL Server') return `jdbc:sqlserver://${host}:${port};databaseName=${dbName}`
    if (jdbc.value.dbType === 'Oracle') return `jdbc:oracle:thin:@${host}:${port}:${dbName}`
    if (jdbc.value.dbType === '达梦') return `jdbc:dm://${host}:${port}/${dbName}`
    if (jdbc.value.dbType === '人大金仓') return `jdbc:kingbase8://${host}:${port}/${dbName}`
    if (jdbc.value.dbType === '其他') return `jdbc:{type}://${host}:${port}/${dbName}`
    return `jdbc:mysql://${host}:${port}/${dbName}?useUnicode=true&characterEncoding=${jdbc.value.charset || 'utf8mb4'}&serverTimezone=${jdbc.value.timezone || 'Asia/Shanghai'}&useSSL=${jdbc.value.sslMode === '开启'}`
  }

  function testJdbc() {
    normalizeJdbcDefaults()
    jdbc.value.status = jdbc.value.name && jdbc.value.dbType && jdbc.value.host && jdbc.value.port && jdbc.value.dbName && jdbc.value.username ? '连通' : '失败'
    jdbc.value.updatedAt = nowText()
  }

  function matchCase(question: string) {
    const q = normalize(question)
    return nl2sqlCases.value.find(item => q.includes(normalize(item.question).slice(0, 6)) || normalize(item.question).includes(q.slice(0, 6))) ?? null
  }

  function matchTerms(question: string) {
    const q = normalize(question)
    return terms.value.filter((item) => {
      const names = [item.term, ...item.aliases.split(/[,，]/).map(v => v.trim()).filter(Boolean)]
      return names.some(name => q.includes(normalize(name)))
    })
  }

  return { nl2sqlCases, terms, jdbc, enabledGoodCases, badCases, normalizeJdbcDefaults, applyDbTypePreset, driverFor, jdbcUrl, testJdbc, matchCase, matchTerms }
}, {
  persist: { key: 'nl2sql-config-store' },
})
