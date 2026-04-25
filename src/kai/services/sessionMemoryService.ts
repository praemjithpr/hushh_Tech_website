import config from '../../resources/config/config';
import { SessionRecord, UserCalibration, DecisionCardData } from '../types';

export class SessionMemoryService {
    private static TABLE_NAME = 'kai_sessions';

    public static async saveSession(
        userId: string,
        calibration: UserCalibration,
        summary: string,
        decisionCards: DecisionCardData[]
    ): Promise<void> {
        const supabase = config.supabaseClient;
        if (!supabase) return;

        const { error } = await supabase
            .from(this.TABLE_NAME)
            .insert({
                user_id: userId,
                calibration,
                summary,
                decision_cards: decisionCards,
            });

        if (error) {
            console.error('Error saving Kai session:', error);
        }
    }

    public static async loadPreviousSessions(userId: string, limit = 5): Promise<SessionRecord[]> {
        const supabase = config.supabaseClient;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error loading Kai sessions:', error);
            return [];
        }

        return (data || []) as SessionRecord[];
    }

    public static async getSessionContext(userId: string): Promise<string> {
        const sessions = await this.loadPreviousSessions(userId, 3);
        if (sessions.length === 0) return '';

        let context = '\n\n### PAST SESSION HISTORY\n';
        sessions.forEach((s, i) => {
            context += `Session ${i + 1} (${new Date(s.created_at).toLocaleDateString()}):\n`;
            context += `- Calibration: ${s.calibration.persona} (${s.calibration.risk} risk)\n`;
            context += `- Summary: ${s.summary}\n`;
            if (s.decision_cards.length > 0) {
                context += `- Key Tickers: ${s.decision_cards.map(c => c.ticker_symbol).filter(Boolean).join(', ')}\n`;
            }
            context += '\n';
        });

        return context;
    }
}
