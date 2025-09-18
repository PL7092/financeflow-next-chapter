import { ParsedTransaction } from './FileParsingService';

export interface Transaction {
  id?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  account: string;
  date: string;
  tags?: string[];
}

export interface AICategorizationSuggestion {
  originalTransaction: ParsedTransaction;
  suggestedCategory: string;
  suggestedType: 'income' | 'expense' | 'transfer';
  suggestedAccount?: string;
  suggestedTags: string[];
  confidence: number;
  reasoning: string;
}

export interface CategorizationResult {
  suggestions: AICategorizationSuggestion[];
  newCategories: string[];
  newTags: string[];
}

export class AICategorizationService {
  private static commonCategories = {
    expense: [
      'Alimentação', 'Supermercado', 'Restaurantes', 'Fast Food',
      'Transporte', 'Combustível', 'Transportes Públicos', 'Táxi/Uber',
      'Casa', 'Renda', 'Condomínio', 'Utilities', 'Internet/Telefone',
      'Saúde', 'Médico', 'Farmácia', 'Seguro Saúde',
      'Educação', 'Cursos', 'Livros', 'Material Escolar',
      'Lazer', 'Cinema', 'Streaming', 'Hobbies', 'Viagens',
      'Vestuário', 'Roupas', 'Calçados', 'Acessórios',
      'Tecnologia', 'Software', 'Hardware', 'Gadgets',
      'Serviços', 'Banco', 'Seguros', 'Impostos',
      'Outros'
    ],
    income: [
      'Salário', 'Freelance', 'Investimentos', 'Dividendos',
      'Aluguel', 'Vendas', 'Bonus', 'Prêmios',
      'Reembolsos', 'Cashback', 'Juros',
      'Outros'
    ]
  };

  private static categoryKeywords = {
    'Alimentação': ['supermercado', 'mercearia', 'padaria', 'açougue', 'peixaria', 'continente', 'pingo doce', 'lidl', 'auchan'],
    'Restaurantes': ['restaurante', 'tasca', 'café', 'bar', 'pizzaria', 'mcdonald', 'burger', 'kfc', 'pizza hut'],
    'Fast Food': ['fast food', 'drive', 'delivery', 'uber eats', 'glovo', 'takeaway'],
    'Combustível': ['galp', 'bp', 'repsol', 'combustível', 'gasoline', 'diesel', 'posto'],
    'Transportes Públicos': ['metro', 'comboio', 'autocarro', 'cp', 'carris', 'andante', 'navegante'],
    'Táxi/Uber': ['uber', 'taxi', 'bolt', 'free now'],
    'Renda': ['renda', 'aluguer', 'rent'],
    'Utilities': ['edp', 'endesa', 'galp energia', 'água', 'gas', 'eletricidade'],
    'Internet/Telefone': ['nos', 'meo', 'vodafone', 'internet', 'telefone', 'mobile'],
    'Farmácia': ['farmácia', 'pharmacy', 'medicamento'],
    'Supermercado': ['continente', 'pingo doce', 'lidl', 'auchan', 'intermarche', 'minipreço'],
    'Banco': ['banco', 'caixa', 'millennium', 'santander', 'bpi', 'novo banco'],
    'Cinema': ['cinema', 'nos cinemas', 'cinema city'],
    'Streaming': ['netflix', 'spotify', 'amazon prime', 'disney+', 'hbo'],
    'Seguros': ['seguro', 'insurance', 'fidelidade', 'tranquilidade'],
    'Salário': ['salário', 'vencimento', 'ordenado', 'salary'],
    'Dividendos': ['dividendo', 'dividend', 'acções', 'etf'],
    'Cashback': ['cashback', 'reembolso', 'refund']
  };

  static async categorizeTransactions(
    transactions: ParsedTransaction[],
    existingTransactions: Transaction[] = [],
    existingCategories: string[] = []
  ): Promise<CategorizationResult> {
    const suggestions: AICategorizationSuggestion[] = [];
    const newCategories = new Set<string>();
    const newTags = new Set<string>();

    // Criar um mapa de padrões baseado no histórico
    const historicalPatterns = this.buildHistoricalPatterns(existingTransactions);

    for (const transaction of transactions) {
      const suggestion = await this.categorizeSingleTransaction(
        transaction,
        historicalPatterns,
        existingCategories
      );
      
      suggestions.push(suggestion);
      
      // Adicionar novas categorias e tags
      if (!existingCategories.includes(suggestion.suggestedCategory)) {
        newCategories.add(suggestion.suggestedCategory);
      }
      
      suggestion.suggestedTags.forEach(tag => {
        if (!existingTransactions.some(t => t.tags?.includes(tag))) {
          newTags.add(tag);
        }
      });
    }

    return {
      suggestions,
      newCategories: Array.from(newCategories),
      newTags: Array.from(newTags)
    };
  }

  private static buildHistoricalPatterns(transactions: Transaction[]): Map<string, { category: string, type: string, count: number }> {
    const patterns = new Map();

    transactions.forEach(transaction => {
      const key = this.normalizeDescription(transaction.description);
      if (patterns.has(key)) {
        patterns.get(key).count++;
      } else {
        patterns.set(key, {
          category: transaction.category,
          type: transaction.type,
          count: 1
        });
      }
    });

    return patterns;
  }

  private static async categorizeSingleTransaction(
    transaction: ParsedTransaction,
    historicalPatterns: Map<string, any>,
    existingCategories: string[]
  ): Promise<AICategorizationSuggestion> {
    const description = transaction.description.toLowerCase();
    const normalizedDesc = this.normalizeDescription(description);
    
    // 1. Verificar padrões históricos
    if (historicalPatterns.has(normalizedDesc)) {
      const pattern = historicalPatterns.get(normalizedDesc);
      return {
        originalTransaction: transaction,
        suggestedCategory: pattern.category,
        suggestedType: pattern.type,
        suggestedTags: this.extractTags(description),
        confidence: 0.95,
        reasoning: `Baseado em ${pattern.count} transações similares no histórico`
      };
    }

    // 2. Usar keywords para categorização
    let bestMatch = { category: 'Outros', confidence: 0.3, type: transaction.type || 'expense' };
    let reasoning = 'Categorização baseada em análise de palavras-chave';

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      for (const keyword of keywords) {
        if (description.includes(keyword.toLowerCase())) {
          const confidence = this.calculateKeywordConfidence(description, keyword);
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              category,
              confidence,
              type: this.inferTypeFromCategory(category)
            };
            reasoning = `Palavra-chave identificada: "${keyword}"`;
          }
        }
      }
    }

    // 3. Análise de valor para inferir tipo
    if (transaction.amount > 1000 && description.includes('salario')) {
      bestMatch = {
        category: 'Salário',
        confidence: 0.9,
        type: 'income'
      };
      reasoning = 'Valor alto com indicativo de salário';
    }

    // 4. Sugerir tags baseadas no contexto
    const suggestedTags = this.extractTags(description);

    return {
      originalTransaction: transaction,
      suggestedCategory: bestMatch.category,
      suggestedType: bestMatch.type as 'income' | 'expense' | 'transfer',
      suggestedTags,
      confidence: bestMatch.confidence,
      reasoning
    };
  }

  private static normalizeDescription(description: string): string {
    return description
      .toLowerCase()
      .replace(/[0-9\-\*\/\\]/g, '') // Remover números e caracteres especiais
      .replace(/\s+/g, ' ') // Normalizar espaços
      .trim()
      .substring(0, 50); // Limitar tamanho
  }

  private static calculateKeywordConfidence(description: string, keyword: string): number {
    const baseConfidence = 0.7;
    const exactMatch = description === keyword ? 0.2 : 0;
    const positionBonus = description.startsWith(keyword) ? 0.1 : 0;
    
    return Math.min(baseConfidence + exactMatch + positionBonus, 0.95);
  }

  private static inferTypeFromCategory(category: string): 'income' | 'expense' | 'transfer' {
    const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Dividendos', 'Aluguel', 'Vendas', 'Bonus', 'Prêmios', 'Reembolsos', 'Cashback', 'Juros'];
    
    if (incomeCategories.includes(category)) {
      return 'income';
    }
    
    return 'expense';
  }

  private static extractTags(description: string): string[] {
    const tags: string[] = [];
    
    // Tags baseadas em padrões comuns
    if (description.includes('online') || description.includes('internet')) {
      tags.push('online');
    }
    
    if (description.includes('cartão') || description.includes('card')) {
      tags.push('cartão');
    }
    
    if (description.includes('transferência') || description.includes('transfer')) {
      tags.push('transferência');
    }
    
    if (description.includes('urgente') || description.includes('emergency')) {
      tags.push('urgente');
    }
    
    if (description.includes('mensal') || description.includes('monthly')) {
      tags.push('recorrente');
    }

    // Extrair possíveis estabelecimentos
    const words = description.split(' ');
    for (const word of words) {
      if (word.length > 4 && word.match(/^[a-zA-Z]+$/)) {
        // Possível nome de estabelecimento
        if (!tags.includes(word) && tags.length < 3) {
          tags.push(word);
        }
      }
    }
    
    return tags.slice(0, 3); // Máximo 3 tags
  }

  static generateFinancialAdvice(suggestions: AICategorizationSuggestion[]): string[] {
    const advice: string[] = [];
    
    // Análise de gastos por categoria
    const categoryTotals = suggestions.reduce((acc, suggestion) => {
      if (suggestion.suggestedType === 'expense') {
        acc[suggestion.suggestedCategory] = (acc[suggestion.suggestedCategory] || 0) + suggestion.originalTransaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0];
      advice.push(`Maior categoria de gastos identificada: ${topCategory[0]} (€${topCategory[1].toFixed(2)})`);
    }

    // Detectar padrões
    const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const foodExpenses = (categoryTotals['Alimentação'] || 0) + (categoryTotals['Restaurantes'] || 0);
    
    if (foodExpenses > totalExpenses * 0.3) {
      advice.push('Gastos com alimentação representam mais de 30% do total. Considere cozinhar mais em casa.');
    }

    if (categoryTotals['Lazer'] > totalExpenses * 0.2) {
      advice.push('Gastos com lazer estão elevados. Reveja o orçamento para esta categoria.');
    }

    return advice;
  }
}