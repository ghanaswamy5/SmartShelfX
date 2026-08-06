import { useState } from 'react';
import {
  Bot,
  Send,
  Loader2,
  TrendingUp,
  Package,
  ShoppingCart,
  Calendar,
  Sparkles,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { aiApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function AiPage() {
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'assistant',
      content: "Hello! I'm your SmartShelfX AI Assistant. How can I help you with inventory management today?"
    }
  ]);
  const [aiResponse, setAiResponse] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // All features share the brand color — variety comes from the icon, not five different hues.
  const features = [
    { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp, description: 'Predict future demand' },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, description: 'Get actionable insights' },
    { id: 'movement', label: 'Movement Analysis', icon: ShoppingCart, description: 'Track product movement' },
    { id: 'seasonal', label: 'Seasonal Prediction', icon: Calendar, description: 'Plan for seasons' },
    { id: 'purchase', label: 'Purchase Suggestions', icon: Package, description: 'Reorder recommendations' },
  ];

  const handleFeatureClick = async (featureId) => {
    setLoading(true);
    setSelectedFeature(featureId);
    setAiResponse(null);

    try {
      let response;
      switch (featureId) {
        case 'forecast':
          response = await aiApi.getForecast(1);
          break;
        case 'recommendations':
          response = await aiApi.getRecommendations();
          break;
        case 'movement':
          response = await aiApi.getMovementAnalysis();
          break;
        case 'seasonal':
          response = await aiApi.getSeasonalPrediction();
          break;
        case 'purchase':
          response = await aiApi.getPurchaseSuggestions();
          break;
        default:
          return;
      }
      setAiResponse(response.data.result);
      toast.success('AI analysis complete!');
    } catch (error) {
      toast.error('Failed to get AI analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatHistory((prev) => [...prev, { type: 'user', content: userMessage }]);
    setChatMessage('');
    setLoading(true);

    try {
      const response = await aiApi.chat(userMessage);
      setChatHistory((prev) => [...prev, { type: 'assistant', content: response.data.result }]);
    } catch (error) {
      toast.error('Failed to get response');
      setChatHistory((prev) => [
        ...prev,
        { type: 'assistant', content: "Sorry, I had trouble processing your request. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
            <h3 key={index} className="text-base font-semibold text-slate-900 mt-4 mb-2">
              {line.replace(/\*\*/g, '')}
            </h3>
        );
      }
      if (line.startsWith('- ')) {
        return (
            <li key={index} className="flex items-start gap-2 text-slate-700 ml-4">
              <span className="text-brand-600 mt-0.5">•</span>
              <span>{line.substring(2)}</span>
            </li>
        );
      }
      if (line.match(/^\d+\./)) {
        const parts = line.split(':');
        return (
            <div key={index} className="flex items-start gap-2 mt-2">
              <span className="font-semibold text-slate-900">{parts[0]}</span>
              <span className="text-slate-700">{parts.slice(1).join(':')}</span>
            </div>
        );
      }
      if (line.includes('URGENT')) {
        return (
            <div key={index} className="flex items-start gap-2 mt-2 p-3 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 text-sm">{line}</span>
            </div>
        );
      }
      if (line.includes('PLANNED')) {
        return (
            <div key={index} className="flex items-start gap-2 mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 text-sm">{line}</span>
            </div>
        );
      }
      if (line.includes('OPTIMIZE')) {
        return (
            <div key={index} className="flex items-start gap-2 mt-2 p-3 bg-accent-50 rounded-lg border border-accent-100">
              <CheckCircle className="h-5 w-5 text-accent-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 text-sm">{line}</span>
            </div>
        );
      }
      if (line.includes('Note:')) {
        return (
            <p key={index} className="text-sm text-slate-500 italic mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              {line}
            </p>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-1" />;
      }
      return (
          <p key={index} className="text-slate-700 leading-relaxed text-sm">
            {line}
          </p>
      );
    });
  };

  return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header — matches page-header/page-title used across the rest of the app */}
        <div className="page-header">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h1 className="page-title">AI Assistant</h1>
              <p className="page-subtitle">Get intelligent insights and recommendations for your inventory</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {features.map((feature) => {
              const isSelected = selectedFeature === feature.id;
              return (
                  <button
                      key={feature.id}
                      onClick={() => handleFeatureClick(feature.id)}
                      disabled={loading}
                      className={`group p-4 rounded-xl border text-left transition-all duration-200 ${
                          isSelected
                              ? 'border-brand-500 bg-brand-50 shadow-card'
                              : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-card'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                            isSelected ? 'bg-brand-100' : 'bg-slate-100 group-hover:bg-brand-50'
                        }`}
                    >
                      <feature.icon className={`h-4.5 w-4.5 ${isSelected ? 'text-brand-600' : 'text-slate-500 group-hover:text-brand-600'}`} />
                    </div>
                    <p className="text-sm font-medium text-slate-900">{feature.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{feature.description}</p>
                  </button>
              );
            })}
          </div>
        </div>

        {/* AI Response */}
        {(loading || aiResponse) && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">AI Analysis</h3>
                </div>
                {selectedFeature && (
                    <span className="text-xs text-slate-500">{features.find((f) => f.id === selectedFeature)?.label}</span>
                )}
              </div>

              <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin text-brand-600 mr-3" />
                      <span className="text-sm">Analyzing your inventory data…</span>
                    </div>
                ) : aiResponse ? (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-brand-600" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">{formatResponse(aiResponse)}</div>
                    </div>
                ) : null}
              </div>
            </div>
        )}

        {/* Chat */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-brand-600" />
              <h3 className="font-semibold text-slate-900 text-sm">AI Chat</h3>
            </div>
            <span className="flex items-center text-xs text-accent-600">
            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full mr-1.5 animate-pulse"></span>
            Online
          </span>
          </div>

          <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
            {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.type === 'user' ? 'bg-slate-200' : 'bg-brand-100'
                      }`}
                  >
                    {msg.type === 'user' ? (
                        <span className="text-xs font-bold text-slate-600">You</span>
                    ) : (
                        <Bot className="h-4 w-4 text-brand-600" />
                    )}
                  </div>
                  <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.type === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-900'
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
            ))}
            {loading && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking…</span>
                </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
            <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about stock levels, sales trends, or product recommendations…"
                className="input-field flex-1"
                disabled={loading}
            />
            <button type="submit" disabled={loading || !chatMessage.trim()} className="btn-primary px-5">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Send</span>
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-400">
          Powered by Google Gemini AI • Responses are simulated for demo purposes
        </div>
      </div>
  );
}