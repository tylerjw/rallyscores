# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html

from scrapy.conf import settings
import logging
import pymongo

class TimecontrolPipeline(object):
    def process_item(self, item, spider):
        return item

class MongoPipeline(object):
    def __init__(self, mongo_db, mongo_collection, id_fields):
        self.mongo_db = mongo_db
        self.mongo_collection = mongo_collection
        self.id_fields = id_fields
        self.logger = logging.getLogger(__name__)

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            mongo_db = crawler.settings.get('MONGO_DATABASE'),
            mongo_collection = crawler.settings.get('MONGO_COLLECTION'),
            id_fields = crawler.settings.get('ID_FIELDS')
        )

    def open_spider(self, spider):
        self.client = pymongo.MongoClient(settings['MONGO_SERVER'])

        start_str = 'starting mongodb client: {} - {}'.format(self.mongo_db, self.mongo_collection)
        self.logger.log(logging.INFO, start_str)
        self.db = self.client[self.mongo_db]

    def close_spider(self, spider):
        close_str = 'closing mongodb client: {} - {}'.format(self.mongo_db, self.mongo_collection)
        self.logger.log(logging.INFO, close_str)
        self.client.close()

    def process_item(self, item, spider):
        uid = {}
        for field in self.id_fields:
            uid[field] = item[field]

        #override update
        self.db[self.mongo_collection].replace_one(uid,item,upsert=True)

        return item
