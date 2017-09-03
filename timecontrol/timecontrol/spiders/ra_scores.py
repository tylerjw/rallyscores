# -*- coding: utf-8 -*-
import scrapy
import re
import logging
import pymongo
import datetime
from daterangeparser import parse

logger = logging.getLogger(__name__)

# scrapy.shell.inspect_response(response, self)

class RaScoresSpider(scrapy.Spider):
    name = 'ra_scores'
    allowed_domains = ['rally-america.com']

    custom_settings = {
        'ITEM_PIPELINES': {}, # exclude the mongodb pipeline as we handle storing result in database in the closed method here
    }

    def __init__(self, year='2017', event_code='COLO', *args, **kwargs):
        super(RaScoresSpider, self).__init__(*args, **kwargs)

        self.year = year
        self.event_code = event_code

        root_url = 'http://www.rally-america.com/events/'
        self.event_url = root_url + year + '/' + event_code
        self.standings_url = root_url + year + '/' + event_code + '/results'
        self.stages_url = root_url + year + '/' + event_code + '/stages'

        self.result = {
            'event_url': self.event_url,
            'year': self.year,
            'event_code': self.event_code,
            'num_stages': 0,
            'stage_info': {},
            'stage_times': {},
            'stage_standings': {},
            'updated': datetime.datetime.now()
        }

    # We never yield data to be written in the standard way, we send it all at once when the spider is done
    def closed(self, reason):
        client = pymongo.MongoClient('localhost:27017')
        resultstable = client['rally']['ra_scores']

        resultstable.replace_one({'year': self.year, 'event_code': self.event_code},self.result,upsert=True)
        client.close()

    def strip_int(self, val, default = None):
        if val:
            val = re.sub('\D','',val)
            if len(val) > 0:
                return int(val)
        return default
        
    def start_requests(self):
        yield scrapy.Request(self.event_url, callback=self.parse_event)
        yield scrapy.Request(self.standings_url, callback=self.parse_standings)
        yield scrapy.Request(self.stages_url, callback=self.parse_stages)

    def parse_event(self, response):
        self.result['event_name'] = response.xpath('//h2[@class="content-title"]/text()[2]').extract_first().strip()
        self.result['town'] = response.xpath('//div[@class="event-details"]/h3[2]/text()').extract_first().strip()
        self.result['event_type'] = response.xpath('//div[@class="event-details"]/h5[1]/text()').extract_first().strip()

        dates = response.xpath('//div[@class="event-details"]/h3[1]/text()').extract_first().strip()
        start, end = parse(dates)
        start = (start if start else parse(self.result['year']))
        self.result['start'] = start
        if end: self.result['end'] = end

    def parse_stage(self, response):
        title = response.xpath('//div[@class="pageHead"]/strong/text()').extract_first()
        match = re.search('Stage (\d+) - (.*)', title)
        stage_num = int(match.group(1))
        location = match.group(2)

        scores = response.xpath('//table[@id="stageScores"]/tbody/tr')

        result = {
            'location': location,
            'source_url': response.url,
            'scores': []
        }

        for score in scores:
            position = self.strip_int(score.xpath('.//td[1]/text()').extract_first())
            car_class = score.xpath('.//td[2]/abbr/text()').extract_first()
            car_class_full = score.xpath('.//td[2]/abbr/@title').extract_first()
            position_in_class = self.strip_int(score.xpath('.//td[3]/text()').extract_first())
            car_number = score.xpath('.//td[4]/text()').extract_first()
            team = score.xpath('.//td[5]/text()').extract_first()
            driver,codriver = '',''
            if team:
                driver,codriver = team.split(' / ')
            dnf = score.xpath('.//td[6]/em/text()').extract_first()

            total_time = ''
            diff_leader = ''
            diff_previous = ''

            if not dnf:
                total_time = score.xpath('.//td[6]/text()').extract_first()
                if total_time: total_time = total_time.strip()
                diff_leader = score.xpath('.//td[7]/text()').extract_first()
                if diff_leader: diff_leader = diff_leader.strip()
                avg_mph = score.xpath('.//td[8]/text()').extract_first()
                if avg_mph: avg_mph = avg_mph.strip()


            result['scores'].append({
                'position': position,
                'car_number': car_number,
                'car_class': car_class,
                'car_class_full': car_class_full,
                'position_in_class': position_in_class,
                'driver': driver,
                'codriver': codriver,
                'dnf': dnf,
                'total_time': total_time,
                'diff_leader': diff_leader,
                'avg_mph': avg_mph,
            })

        self.result['stage_times'][str(stage_num)] = result
        if stage_num > self.result['num_stages']:
            self.result['num_stages'] = stage_num

    def parse_stages(self, response):
        result = {
            'source_url': response.url,
            'stages': []
        }

        stages = response.xpath('//table[@class="table small schedule"]/tbody/tr')
        date = ''
        for stage in stages:
            if stage.xpath('.//@class').extract_first() == 'header':
                date = stage.xpath('.//th/text()').extract_first()
            else:
                url = response.urljoin(stage.xpath('.//td[1]/a/@href').extract_first())
                stage_num = int(stage.xpath('.//td[1]/a/text()').extract_first())
                location = stage.xpath('.//td[2]/a/text()').extract_first()
                start = stage.xpath('.//td[3]/text()').extract_first()
                length = stage.xpath('.//td[4]/text()').extract_first()
                leader = stage.xpath('.//td[5]/text()').extract_first()

                yield scrapy.Request(url, callback=self.parse_stage)

                result['stages'].append({
                    'date': date,
                    'stage_url': url,
                    'stage_number': stage_num,
                    'location': location,
                    'start': start,
                    'length': length,
                    'leader': leader,
                })

                if stage_num > self.result['num_stages']:
                    self.result['num_stages'] = stage_num

        self.result['stage_info'] = result

    def parse_standings(self, response):
        #walk backwards
        prev = response.xpath('//li[@id="page-prev"]/a/@href').extract_first()
        if prev:
            print(prev)
            yield scrapy.Request(response.urljoin(prev), callback=self.parse_standings)

        title = response.xpath('//span[@class="head-stage"]/strong/text()').extract_first()
        match = re.search('Stage (\d+) - (.*)', title)
        stage_num = int(match.group(1))
        location = match.group(2)

        logger.debug("Stage: {}, Road: {}".format(stage_num,location))

        result = {
            'location': location,
            'source_url': response.url,
            'scores': []
        }

        standings = response.xpath('//table[@id="stageScores"]/tbody/tr')

        for team in standings:
            position = self.strip_int(team.xpath('.//td[1]/text()').extract_first())
            position_up = self.strip_int(team.xpath('.//td[1]/span[@class="shift-up"]/text()').extract_first(), 0)
            position_down = self.strip_int(team.xpath('.//td[1]/span[@class="shift-dn"]/text()').extract_first(), 0)
            position_delta = position_up - position_down

            car_number = team.xpath('.//td[2]/text()').extract_first()
            car_class = team.xpath('.//td[3]/abbr/text()').extract_first()
            car_class_full = team.xpath('.//td[3]/abbr/@title').extract_first()

            position_in_class = self.strip_int(team.xpath('.//td[4]/text()').extract_first())
            position_in_class_up = self.strip_int(team.xpath('.//td[4]/span[@class="shift-up"]/text()').extract_first(), 0)
            position_in_class_down = self.strip_int(team.xpath('.//td[4]/span[@class="shift-dn"]/text()').extract_first(), 0)
            position_in_class_delta = position_in_class_up - position_in_class_down

            driver = team.xpath('.//td[5]/a[1]/text()').extract_first()
            driver_url = response.urljoin(team.xpath('.//td[5]/a[1]/@href').extract_first())
            codriver = team.xpath('.//td[5]/a[2]/text()').extract_first()
            codriver_url = response.urljoin(team.xpath('.//td[5]/a[2]/@href').extract_first())

            car = team.xpath('.//td[5]/text()').extract()[1].strip()

            dnf = team.xpath('.//td[6]/em/text()').extract_first()

            total_time = ''
            penalties = []
            total_penalty_time = ''
            diff_leader = ''
            diff_previous = ''

            if not dnf:
                total_time = team.xpath('.//td[6]/text()').extract_first()

                if total_time:
                    total_time = total_time.strip()
                else:
                    total_time = ''

                if len(total_time) == 0:
                    #penalties
                    total_time = team.xpath('.//td[6]/label/a/text()').extract_first()
                    descriptions = team.xpath('.//td[6]/div/span[@class="table small"]/text()').extract()
                    times = team.xpath('.//td[6]/div/span[@class="time"]/text()').extract()
                    penalties = list(zip(descriptions[:-1], times[:-1]))
                    total_penalty_time = times[-1]

                diff_leader = team.xpath('.//td[7]/text()').extract_first().strip()
                diff_previous = team.xpath('.//td[8]/text()').extract_first().strip()


            result['scores'].append({
                'position': position,
                'position_delta': position_delta,
                'car_number': car_number,
                'car_class': car_class,
                'car_class_full': car_class_full,
                'position_in_class': position_in_class,
                'position_in_class_delta': position_in_class_delta,
                'driver': driver,
                'driver_url': driver_url,
                'codriver': codriver,
                'codriver_url': codriver_url,
                'car': car,
                'dnf': dnf,
                'total_time': total_time,
                'total_penalty_time': total_penalty_time,
                'penalties': penalties,
                'diff_leader': diff_leader,
                'diff_previous': diff_previous
            })

        self.result['stage_standings'][str(stage_num)] = result
        if stage_num > self.result['num_stages']:
            self.result['num_stages'] = stage_num
