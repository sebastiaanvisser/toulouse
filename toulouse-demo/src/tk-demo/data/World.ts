export interface Capital {
    name: string
    role: string
}

export interface Country {
    name: string
    capitals: Capital[]
    regions: string[]
}

export const fetchCountries = async (): Promise<Country[]> => {
    const res = await fetch('/random')
    const json = await res.json()
    return json.countries
}
