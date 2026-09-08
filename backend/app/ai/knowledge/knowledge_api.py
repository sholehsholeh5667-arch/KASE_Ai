"""
Knowledge API
=============

Interface utama Knowledge Base.
"""

from app.ai.knowledge.knowledge_manager import KnowledgeManager
from app.ai.knowledge.knowledge_loader import KnowledgeLoader
from app.ai.knowledge.knowledge_search import KnowledgeSearch
from app.ai.knowledge.knowledge_router import KnowledgeRouter
from app.ai.knowledge.knowledge_memory import KnowledgeMemory
from app.ai.knowledge.knowledge_ranking import KnowledgeRanking
from app.ai.knowledge.rag_engine import RAGEngine
from app.ai.knowledge.multi_source import MultiKnowledgeSource
from app.ai.knowledge.knowledge_cache import KnowledgeCache


class KnowledgeAPI:
    """
    API utama Knowledge Base.
    """

    def __init__(self):

        self.manager = KnowledgeManager()

        self.loader = KnowledgeLoader(
            self.manager
        )

        self.search = KnowledgeSearch(
            self.manager
        )

        self.router = KnowledgeRouter(
            self.manager
        )

        self.memory = KnowledgeMemory()

        self.ranking = KnowledgeRanking()

        self.cache = KnowledgeCache()

        self.multi_source = MultiKnowledgeSource(
            self.manager
        )

        self.rag = RAGEngine(
            self.manager
        )

    # =======================================
    # Load
    # =======================================

    def load(
        self,
        category,
        data
    ):

        self.loader.load(
            category,
            data
        )

    # =======================================
    # Search
    # =======================================

    def search_all(
        self,
        keyword
    ):

        return self.search.search(
            keyword
        )

    def search_category(
        self,
        category,
        keyword
    ):

        return self.search.search_category(
            category,
            keyword
        )

    # =======================================
    # Router
    # =======================================

    def route(
        self,
        request
    ):

        return self.router.route(
            request
        )

    # =======================================
    # RAG
    # =======================================

    def retrieve(
        self,
        session_id,
        message,
        db=None,
    ):
        """
        Mengambil knowledge untuk RAG.

        db diteruskan ke RAGEngine agar
        kategori Muamalah dapat mengambil
        data langsung dari MySQL.
        """

        return self.rag.retrieve(
            {
                "session_id": session_id,
                "message": message,
                "db": db,
            }
        )

    # =======================================
    # Memory
    # =======================================

    def get_memory(
        self,
        session_id
    ):

        return self.memory.load(
            session_id
        )

    # =======================================
    # Cache
    # =======================================

    def cache_get(
        self,
        category,
        keyword
    ):

        return self.cache.get(
            category,
            keyword
        )

    def cache_set(
        self,
        category,
        keyword,
        value
    ):

        self.cache.set(
            category,
            keyword,
            value
        )

    # =======================================
    # Multi Source
    # =======================================

    def sources(self):

        return self.multi_source.available_sources()

    def count_sources(self):

        return self.multi_source.count_sources()

    # =======================================
    # Statistics
    # =======================================

    def total_categories(self):

        return len(
            self.manager.categories()
        )

    def total_knowledge(self):

        return self.manager.count()