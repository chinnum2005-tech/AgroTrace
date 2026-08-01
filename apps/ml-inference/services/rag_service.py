import json
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Seeded knowledge base
KNOWLEDGE_BASE = [
    {
        "id": "doc_msp_wheat",
        "title": "Minimum Support Price for Wheat 2024-25",
        "content": "The Government has approved the Minimum Support Price (MSP) for Wheat for the 2024-25 marketing season at ₹2,275 per quintal, an increase of ₹150 from the previous year.",
        "sourceUrl": "https://farmer.gov.in/msp2024",
        "sourceDate": "2024-01-15T00:00:00Z"
    },
    {
        "id": "doc_msp_paddy",
        "title": "Minimum Support Price for Paddy 2024-25",
        "content": "The MSP for Paddy (Common) for the 2024-25 Kharif season is set at ₹2,300 per quintal, and Paddy (Grade A) at ₹2,320 per quintal.",
        "sourceUrl": "https://farmer.gov.in/msp2024_kharif",
        "sourceDate": "2024-06-10T00:00:00Z"
    },
    {
        "id": "doc_pest_cotton",
        "title": "Pink Bollworm Management in Cotton",
        "content": "To manage Pink Bollworm in Cotton, farmers should install pheromone traps at 5 per acre. If trap catches exceed 8 moths/trap/night for three consecutive nights, spray Quinalphos 20 AF @ 500 ml/acre.",
        "sourceUrl": "https://agricoop.nic.in/pest-management",
        "sourceDate": "2023-11-20T00:00:00Z"
    },
    {
        "id": "doc_disease_rice",
        "title": "Rice Blast Disease Guidelines",
        "content": "Rice blast symptoms include spindle-shaped lesions on leaves with gray centers. Preventative measures include seed treatment with Tricyclazole 75 WP at 2g/kg seed. For field outbreak, spray Tricyclazole @ 120g/acre.",
        "sourceUrl": "https://agricoop.nic.in/rice-blast",
        "sourceDate": "2024-02-05T00:00:00Z"
    },
    {
        "id": "doc_irrigation_drip",
        "title": "PMKSY Drip Irrigation Subsidy",
        "content": "Under Pradhan Mantri Krishi Sinchayee Yojana (PMKSY), small and marginal farmers can avail a 55% subsidy for installing micro-irrigation (drip/sprinkler) systems. Other farmers are eligible for 45%.",
        "sourceUrl": "https://pmksy.gov.in/micro-irrigation",
        "sourceDate": "2024-01-01T00:00:00Z"
    }
]

class RAGService:
    def __init__(self):
        self.documents = KNOWLEDGE_BASE
        # Prepare corpus for TF-IDF
        self.corpus = [doc["title"] + " " + doc["content"] for doc in self.documents]
        
        # Initialize and fit TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(stop_words='english')
        if len(self.corpus) > 0:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)
        else:
            self.tfidf_matrix = None

    def search(self, query: str, threshold: float = 0.15):
        """
        Search the knowledge base using cosine similarity of TF-IDF vectors.
        Note: We use a relatively low threshold here because TF-IDF is sparse 
        and exact word overlaps might be small on short queries. 
        In production with dense embeddings (e.g. OpenAI ada-002), threshold would be ~0.75.
        """
        if self.tfidf_matrix is None:
            return []
            
        # Vectorize the query
        query_vec = self.vectorizer.transform([query])
        
        # Calculate cosine similarity
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        # Get matching indices above threshold
        results = []
        for idx, score in enumerate(similarities):
            if score >= threshold:
                doc = self.documents[idx].copy()
                doc["score"] = float(score)
                results.append(doc)
                
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results

rag_service = RAGService()
