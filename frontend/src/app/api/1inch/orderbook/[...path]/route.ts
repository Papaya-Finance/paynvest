import { NextRequest, NextResponse } from 'next/server'

const ONEINCH_API_BASE = 'https://api.1inch.dev'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const apiKey = process.env.ONEINCH_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: '1inch API key not configured' },
        { status: 500 }
      )
    }

    // Get the path from the request URL
    const { searchParams } = new URL(request.url)
    const { path } = await params

    const fixedPath = '/' + path.join('/')
    
    // Build the target URL with orderbook path
    const targetUrl = new URL(`${ONEINCH_API_BASE}/orderbook${fixedPath}`)
    
    // Copy all search parameters
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value)
    })

    console.log('Proxying GET request to:', targetUrl.toString())
    console.log('Original request URL:', request.url)
    console.log('Path params:', path)
    console.log('Search params:', Object.fromEntries(searchParams.entries()))
    const huy ={
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
      console.log('Headers HUY:', huy)

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: huy
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('1inch API error:', errorText)
      return NextResponse.json(
        { 
          error: 'Failed to connect to 1inch API',
          status: response.status,
          details: errorText
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('1inch API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to 1inch API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const apiKey = process.env.ONEINCH_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: '1inch API key not configured' },
        { status: 500 }
      )
    }

    // Get the path from the request URL
    const { path } = await params

    const fixedPath = '/' + path.join('/')
    
    // Build the target URL with orderbook path
    const targetUrl = new URL(`${ONEINCH_API_BASE}/orderbook${fixedPath}`)

    // Get the request body
    const body = await request.json()

    console.log('Proxying POST request to:', targetUrl.toString())
    console.log('Original request URL:', request.url)
    console.log('Path params:', path)
    console.log('Request body:', body)

    const response = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('1inch API error:', errorText)
      return NextResponse.json(
        { 
          error: 'Failed to connect to 1inch API',
          status: response.status,
          details: errorText
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('1inch API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to 1inch API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const apiKey = process.env.ONEINCH_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: '1inch API key not configured' },
        { status: 500 }
      )
    }
                    
    // Get the path from the request URL
    const { path } = await params
    const fixedPath = '/' + path.join('/')
    
    // Build the target URL with orderbook path
    const targetUrl = new URL(`${ONEINCH_API_BASE}/orderbook${fixedPath}`)

    console.log('Proxying DELETE request to:', targetUrl.toString())
    console.log('Original request URL:', request.url)
    console.log('Path params:', path)

    const response = await fetch(targetUrl.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('1inch API error:', errorText)
      return NextResponse.json(
        { 
          error: 'Failed to connect to 1inch API',
          status: response.status,
          details: errorText
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('1inch API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to 1inch API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 