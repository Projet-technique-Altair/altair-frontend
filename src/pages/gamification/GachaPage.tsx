import { useEffect, useState } from "react"

import {
  getGachaConfig,
  getCurrencyBalance,
  getGachaHistory,
  openCapsule
} from "@/api/gacha"

import type {
  GachaConfig,
  CurrencyBalance,
  GachaHistoryEntry,
  GachaOpenResponse
} from "@/contracts/gacha"

import GachaMenu from "@/components/gacha/GachaMenu"
import GachaOpening from "@/components/gacha/GachaOpening"
import GachaResult from "@/components/gacha/GachaResult"
import { publishGachaScene } from "@/components/gacha/gachaScene"

type GachaState =
  | "menu"
  | "opening"
  | "result"

export default function GachaPage() {

  const [state, setState] = useState<GachaState>("menu")

  const [config, setConfig] = useState<GachaConfig | null>(null)
  const [balance, setBalance] = useState<CurrencyBalance | null>(null)
  const [history, setHistory] = useState<GachaHistoryEntry[]>([])

  const [result, setResult] = useState<GachaOpenResponse | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publishGachaScene(state)

    return () => {
      publishGachaScene("menu")
    }
  }, [state])

  useEffect(() => {

    async function load() {

      try {

        const [cfg, bal, hist] = await Promise.all([
          getGachaConfig(),
          getCurrencyBalance(),
          getGachaHistory(),
        ])

        setConfig(cfg)
        setBalance(bal)
        setHistory(hist.entries)

      } catch (err) {

        console.error("Gacha load error:", err)

      } finally {

        setLoading(false)

      }

    }

    load()

  }, [])

  async function handleOpen() {

    if (!config) return

    try {

      setResult(null)
      setState("opening")

      const res = await openCapsule(config.capsules[0].capsule_type)

      setResult(res)

      const [bal, hist] = await Promise.all([
        getCurrencyBalance(),
        getGachaHistory(),
      ])
      setBalance(bal)
      setHistory(hist.entries)
      window.dispatchEvent(new Event("altair-profile-updated"))

    } catch (err) {

      console.error("Gacha open error:", err)
      setResult(null)
      setState("menu")

    }

  }

  function handleBack() {

    setState("menu")
    setResult(null)

  }

  if (loading) {

    return (
      <div className="text-white p-10">
        Loading gacha…
      </div>
    )

  }

  if (!config || !balance) {

    return (
      <div className="text-white p-10">
        Gacha unavailable
      </div>
    )

  }

  if (state === "menu") {

    return (
      <GachaMenu
        config={config}
        balance={balance}
        history={history}
        onOpen={handleOpen}
      />
    )

  }

  if (state === "opening") {

    return (
      <GachaOpening
        result={result}
        onReveal={() => {
          if (result) {
            setState("result")
          }
        }}
      />
    )

  }

  if (state === "result" && result) {

    return (
      <GachaResult
        result={result}
        onBack={handleBack}
        onOpenAgain={handleOpen}
      />
    )

  }

  return null
}
