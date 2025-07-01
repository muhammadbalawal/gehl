import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leads, campaign_id, user_id } = body;

    if (!leads || !Array.isArray(leads) || !campaign_id || !user_id) {
      return NextResponse.json({
        success: false,
        error: 'leads array, campaign_id, and user_id are required'
      }, { status: 400 });
    }

    // Prepare leads data for insertion
    const leadsToInsert = leads.map(lead => ({
      name: lead.name || null,
      location: lead.location || null,
      gmb_link: lead.gmb_link || null,
      email: lead.email || null,
      phone_number: lead.phone_number || null,
      website: lead.website || null,
      latitude: lead.latitude ? parseFloat(lead.latitude) : null,
      longitude: lead.longitude ? parseFloat(lead.longitude) : null,
      campaign_id: campaign_id,
      user_id: user_id,
      status: 'New Lead',
      created_at: new Date().toISOString()
    }));

    // Bulk insert leads
    const { data, error } = await supabase
      .from('lead')
      .insert(leadsToInsert)
      .select();

    if (error) {
      console.error('Error creating leads:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      leads: data,
      count: data.length
    });

  } catch (error) {
    console.error('Lead creation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');
    const campaign_id = searchParams.get('campaign_id');

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'user_id is required'
      }, { status: 400 });
    }

    let query = supabase
      .from('lead')
      .select(`
        *,
        campaign:campaign_id(name)
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      leads: data
    });

  } catch (error) {
    console.error('Lead fetch failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 