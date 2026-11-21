import { describe, expect, it, vi } from 'vitest'
import {
  createCommandSearchSource,
  searchCommands,
  type CommandSearchItem,
} from './command-search'

const item = (
  id: string,
  label: string,
  keywords = '',
  group = 'Accounts',
): CommandSearchItem => ({
  id,
  label,
  keywords,
  auxiliaryData: { group },
  run: vi.fn(),
})

describe('command search', () => {
  it('matches symbols, owners and accounts together regardless of case or accents', () => {
    const apple = item(
      'investment:1',
      'Apple',
      'AAPL Montréal brokerage Joey',
      'Investments',
    )
    const otherOwner = item(
      'investment:2',
      'Apple',
      'AAPL Savings Jane',
      'Investments',
    )
    expect(
      searchCommands([apple, otherOwner], '  aapl   joey montreal '),
    ).toEqual([apple])
    expect(searchCommands([apple, otherOwner], 'absent')).toEqual([])
  })

  it('prioritizes matching names while retaining matches in supporting information', () => {
    const secondary = item('account:1', 'Checking', 'TD Joey')
    const primary = item('account:2', 'TD Savings', 'Joey')
    expect(searchCommands([secondary, primary], 'TD')).toEqual([
      primary,
      secondary,
    ])
  })

  it('shares one request across bootstrap and typing and searches beyond the initial suggestions', async () => {
    const entities = Array.from({ length: 75 }, (_, index) =>
      item(`account:${index}`, `Account ${index}`),
    )
    const load = vi.fn(async () => entities)
    const source = createCommandSearchSource({
      commands: [],
      load,
      onError: vi.fn(),
    })
    const [initial, results] = await Promise.all([
      source.bootstrap(),
      source.search('Account 74'),
    ])
    expect(initial).toHaveLength(3)
    expect(results).toEqual([entities[74]])
    expect(load).toHaveBeenCalledTimes(1)
    source.select('account:74')
    expect(entities[74].run).toHaveBeenCalledOnce()
  })

  it('keeps identically named holdings in separate accounts independently navigable', async () => {
    const first = item(
      'investment:1',
      'Apple',
      'AAPL Broker One',
      'Investments',
    )
    const second = item(
      'investment:2',
      'Apple',
      'AAPL Broker Two',
      'Investments',
    )
    const source = createCommandSearchSource({
      commands: [],
      load: async () => [first, second],
      onError: vi.fn(),
    })
    expect(await source.search('AAPL')).toEqual([first, second])
    source.select(second.id)
    expect(second.run).toHaveBeenCalledOnce()
    expect(first.run).not.toHaveBeenCalled()
  })

  it('keeps navigation available after a load failure and retries the next search', async () => {
    const command = item('command:accounts', 'Accounts', '', 'Go to')
    const account = item('account:1', 'Checking')
    const load = vi
      .fn<() => Promise<CommandSearchItem[]>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([account])
    const onError = vi.fn()
    const source = createCommandSearchSource({
      commands: [command],
      load,
      onError,
    })
    expect(await source.bootstrap()).toEqual([command])
    expect(onError).toHaveBeenLastCalledWith(true)
    expect(await source.search('Checking')).toEqual([account])
    expect(onError).toHaveBeenLastCalledWith(false)
  })
})
